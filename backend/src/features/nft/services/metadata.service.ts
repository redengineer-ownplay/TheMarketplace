import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { formatTokenUrl } from 'src/utils/strings/formatTokenUrl';
import { isHtmlResponse } from 'src/utils/html/isHtmlResponse';

@Injectable()
export class NFTMetadataService {
  private readonly logger = new Logger(NFTMetadataService.name);
  private provider: ethers.providers.JsonRpcProvider;
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private readonly NFT_ABI = [
    // ERC721
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function uri(uint256 tokenId) view returns (string)', // ERC1155
    'function balanceOf(address owner, uint256 id) view returns (uint256)', // ERC1155
    'function balanceOf(address owner) view returns (uint256)', // ERC721
    'function name() view returns (string)',
    'function symbol() view returns (string)',
  ];

  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient,
    private configService: ConfigService,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('POLYGON_RPC_URL'),
    );
    this.provider.polling = true;
    this.provider.pollingInterval = 10000;
  }

  async getMetadata(contractAddress: string, tokenId: string) {
    try {
      const cachedData = await this.checkCache(contractAddress, tokenId);
      if (cachedData) {
        return cachedData.metadata;
      }

      const metadata = await this.fetchMetadataFromContract(contractAddress, tokenId);

      await this.updateMetadataCache(contractAddress, tokenId, metadata);

      return metadata;
    } catch (error: any) {
      this.logger.error(
        `Error fetching metadata for ${contractAddress}:${tokenId} - ${error.message}`,
      );

      const cachedData = await this.checkCache(contractAddress, tokenId, true);
      if (cachedData) {
        return cachedData.metadata;
      }

      return this.getFallbackMetadata(contractAddress, tokenId);
    }
  }

  private async fetchMetadataFromContract(contractAddress: string, tokenId: string) {
    const contract = new ethers.Contract(contractAddress, this.NFT_ABI, this.provider);

    try {
      // Try ERC721 tokenURI first
      let tokenURI;
      try {
        tokenURI = await contract.tokenURI(tokenId);
      } catch {
        // If tokenURI fails, try ERC1155 uri
        try {
          tokenURI = await contract.uri(tokenId);
          tokenURI = tokenURI.replace('{id}', tokenId.padStart(64, '0'));
        } catch {
          throw new Error('Failed to fetch token URI');
        }
      }

      const formattedURI = formatTokenUrl(tokenURI);
      return await this.fetchAndParseMetadata(formattedURI);
    } catch (error: any) {
      this.logger.error(
        `Contract interaction error for ${contractAddress}:${tokenId} - ${error.message}`,
      );
      throw error;
    }
  }

  private async fetchAndParseMetadata(uri: string) {
    try {
      const formattedUri = formatTokenUrl(uri);
      const isIpfs = formattedUri.includes('/ipfs/');
      let responseText: string | undefined;

      if (isIpfs) {
        const ipfsHash = formattedUri.split('/ipfs/')[1];
        const gateways = [
          'https://ipfs.io/ipfs/',
          'https://cloudflare-ipfs.com/ipfs/',
          'https://gateway.pinata.cloud/ipfs/',
        ];

        for (const gateway of gateways) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${gateway}${ipfsHash}`, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'User-Agent': 'NFT-Platform/1.0',
              },
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok) {
              const textData = await response.text();
              if (!isHtmlResponse(textData)) {
                responseText = textData;
                break;
              }
            }
          } catch {
            continue;
          }
        }
        if (!responseText) {
          throw new Error('Failed to fetch from all IPFS gateways');
        }
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(formattedUri, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'NFT-Platform/1.0',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const textData = await response.text();
        if (isHtmlResponse(textData)) {
          throw new Error('Received HTML instead of JSON');
        }
        responseText = textData;
      }

      const metadata = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;

      return this.validateAndFormatMetadata(metadata);
    } catch (error: any) {
      this.logger.error(`Metadata fetch error for ${uri}: ${error.message}`);
      return {
        name: 'Unknown NFT',
        description: 'Metadata temporarily unavailable',
        image: '',
        attributes: [],
      };
    }
  }

  private validateAndFormatMetadata(metadata: any) {
    return {
      name: metadata.name || 'Unnamed NFT',
      description: metadata.description || 'No description available',
      image: formatTokenUrl(metadata.image || metadata.image_url || ''),
      attributes: Array.isArray(metadata.attributes) ? metadata.attributes : [],
      ...metadata,
    };
  }

  private getFallbackMetadata(contractAddress: string, tokenId: string) {
    return {
      name: `NFT ${tokenId}`,
      description: 'Metadata temporarily unavailable',
      image: '',
      attributes: [],
      contract_address: contractAddress,
      token_id: tokenId,
    };
  }

  private async checkCache(contractAddress: string, tokenId: string, ignoreAge = false) {
    try {
      const { data: cachedMetadata, error: cacheError } = await this.supabase
        .from('nft_metadata')
        .select('*')
        .eq('contract_address', contractAddress.toLowerCase())
        .eq('token_id', tokenId)
        .single();

      if (cacheError) return null;

      if (
        cachedMetadata &&
        (ignoreAge ||
          Date.now() - new Date(cachedMetadata.last_updated).getTime() < this.CACHE_DURATION)
      ) {
        return cachedMetadata;
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Cache check error: ${error.message}`);
      return null;
    }
  }

  private async updateMetadataCache(contractAddress: string, tokenId: string, metadata: any) {
    try {
      const { error } = await this.supabase
        .from('nft_metadata')
        .upsert({
          contract_address: contractAddress.toLowerCase(),
          token_id: tokenId,
          metadata,
          last_updated: new Date().toISOString(),
          last_checked: new Date().toISOString(),
          image_url: metadata.image || metadata.image_url || '',
          name: metadata.name || `NFT ${tokenId}`,
          description: metadata.description || 'No description available',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Cache update error: ${error.message}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to update metadata cache: ${error.message}`);
    }
  }

  async getMetadataBatch(nfts: Array<{ contractAddress: string; tokenId: string }>) {
    const results = await Promise.allSettled(
      nfts.map(nft => this.getMetadata(nft.contractAddress, nft.tokenId)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return this.getFallbackMetadata(nfts[index].contractAddress, nfts[index].tokenId);
    });
  }
}
