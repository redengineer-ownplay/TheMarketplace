import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { NFTMetadataService } from './metadata.service';
import { Transaction } from '../interfaces/transaction.interface';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTransactionDto } from '../dto/transfer.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { TransactionService } from 'src/features/transaction/services/transaction.service';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  public static readonly CACHE_KEY_PREFIX = 'NFTS_LIST_';
  private readonly TRANSACTIONS_HISTORY = TransactionService.CACHE_KEY_PREFIX;

  // Basic ABI for NFT transfers
  private readonly NFT_ABI = [
    'function transferFrom(address from, address to, uint256 tokenId)',
    'function safeTransferFrom(address from, address to, uint256 tokenId)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function balanceOf(address owner, uint256 id) view returns (uint256)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',
    'function approve(address to, uint256 tokenId)',
    'function setApprovalForAll(address operator, bool approved)',
  ];

  constructor(
    private configService: ConfigService,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
    private metadataService: NFTMetadataService,
    private readonly cacheService: CacheService,
  ) {
    const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      throw new Error('Missing configuration for NFT service');
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async getNFTs(walletAddress: string, { limit = 10, offset = 0 }: PaginationDto) {
    try {
      const cacheKey = `${NftService.CACHE_KEY_PREFIX}${walletAddress}_${limit}_${offset}`;

      const cachedNFTs = await this.cacheService.get(cacheKey);
      if (cachedNFTs) {
        return JSON.parse(cachedNFTs);
      }

      const nfts = await this.fetchAllNFTs(walletAddress);
      const total = nfts.length;
      const paginatedNFTs = nfts.slice(offset, offset + limit);

      const response = {
        data: paginatedNFTs,
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      };

      await this.cacheService.set(cacheKey, JSON.stringify(response), 300);

      return response;
    } catch (error: any) {
      this.logger.error(`Error in getNFTs: ${error.message}`);
      return await this.getMetadata(walletAddress, limit, offset);
    }
  }

  private async getMetadata(walletAddress: string, limit: number, offset: number) {
    const { data: nftsMetaData, count } = await this.supabase
      .from('nft_metadata')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress.toLowerCase())
      .range(offset, offset + limit - 1);

    return {
      data: nftsMetaData || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    };
  }

  async fetchAllNFTs(walletAddress: string) {
    this.logger.log(`Fetching NFTs for wallet: ${walletAddress}`);

    try {
      const transactions = await this.fetchNFTTransactions(walletAddress);
      if (!transactions.length) return [];

      const nfts = await this.processTransactions(walletAddress, transactions);
      await this.insertNFTsMetaData(walletAddress, nfts);
      return nfts;
    } catch (error: any) {
      this.logger.error(`Error in fetchAllNFTs: ${error.message}`);
      return this.getFallbackMetadata(walletAddress);
    }
  }

  private async processTransactions(walletAddress: string, transactions: any[]) {
    const uniqueTokens = new Map();

    for (const tx of transactions.reverse()) {
      const key = `${tx.contractAddress}-${tx.tokenID}`;

      if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
        try {
          const isOwner = await this.verifyNFTOwnership(
            walletAddress,
            tx.contractAddress,
            tx.tokenID,
          );

          if (isOwner && !uniqueTokens.has(key)) {
            const metadata = await this.getTokenMetadata(tx.contractAddress, tx.tokenID);
            uniqueTokens.set(key, {
              contractAddress: tx.contractAddress,
              tokenId: tx.tokenID,
              tokenType: 'ERC721',
              metadata,
              tokenName: tx.tokenName || 'Unknown Token',
            });
          }
        } catch (error: any) {
          this.logger.error(
            `Error processing token ${tx.tokenID} from ${tx.contractAddress}: ${error.message}`,
          );
        }
      } else if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
        uniqueTokens.delete(key);
      }
    }

    return Array.from(uniqueTokens.values());
  }

  private async getTokenMetadata(contractAddress: string, tokenId: string) {
    try {
      return await this.metadataService.getMetadata(contractAddress, tokenId);
    } catch (error: any) {
      this.logger.error(
        `Error fetching metadata for ${contractAddress}:${tokenId} - ${error.message}`,
      );
      return {
        name: `NFT #${tokenId}`,
        description: 'Metadata temporarily unavailable',
        image: '',
      };
    }
  }

  private async fetchNFTTransactions(walletAddress: string) {
    const polygonScanApiKey = this.configService.get<string>('POLYGON_SCAN_API_KEY');
    const params = new URLSearchParams({
      module: 'account',
      action: 'tokennfttx',
      address: walletAddress,
      startblock: '0',
      endblock: '999999999',
      sort: 'asc',
      apikey: polygonScanApiKey || '',
    });
    const url = `https://api.polygonscan.com/api?${params.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === '1' && Array.isArray(data.result)) {
        return data.result;
      }
      return [];
    } catch (error: any) {
      this.logger.error(`Error fetching NFT transactions: ${error.message}`);
      return [];
    }
  }

  private async insertNFTsMetaData(walletAddress: string, nfts: any[]) {
    try {
      if (nfts.length === 0) return;

      const nftMetaDataData = nfts.map(nft => ({
        owner_address: walletAddress.toLowerCase(),
        contract_address: nft.contractAddress.toLowerCase(),
        token_id: nft.tokenId,
        metadata: nft.metadata,
        token_type: nft.tokenType || 'ERC721',
        last_updated: new Date().toISOString(),
      }));

      const { error } = await this.supabase.from('nft_metadata').upsert(nftMetaDataData, {
        onConflict: 'contract_address,token_id',
      });

      if (error) {
        this.logger.error(`nftMetaData upsert error: ${error.message}`);

        for (const nft of nftMetaDataData) {
          try {
            await this.supabase.from('nft_metadata').upsert(nft, {
              onConflict: 'contract_address,token_id',
            });
          } catch (individualError: any) {
            this.logger.error(
              `Error updating individual NFT ${nft.contract_address}:${nft.token_id} - ${individualError.message}`,
            );
          }
        }
      }

      const validTokenKeys = new Set(
        nftMetaDataData.map(nft => `${nft.contract_address}-${nft.token_id}`),
      );

      const { data: existingEntries } = await this.supabase
        .from('nft_metadata')
        .select('contract_address, token_id')
        .eq('owner_address', walletAddress.toLowerCase());

      if (existingEntries) {
        const entriesToDelete = existingEntries.filter(
          entry => !validTokenKeys.has(`${entry.contract_address}-${entry.token_id}`),
        );

        if (entriesToDelete.length > 0) {
          for (const entry of entriesToDelete) {
            await this.supabase
              .from('nft_metadata')
              .delete()
              .eq('owner_address', walletAddress.toLowerCase())
              .eq('contract_address', entry.contract_address)
              .eq('token_id', entry.token_id);
          }
        }
      }
    } catch (error: any) {
      this.logger.error(`Error caching NFTs: ${error.message}`);
    }
  }

  private async getFallbackMetadata(walletAddress: string) {
    const { data: metadataNFTs } = await this.supabase
      .from('nft_metadata')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase());

    return metadataNFTs || [];
  }

  async verifyNFTOwnership(
    walletAddress: string,
    contractAddress: string,
    tokenId: string,
  ): Promise<boolean> {
    try {
      const contract = new ethers.Contract(contractAddress, this.NFT_ABI, this.provider);
      const owner = await contract.ownerOf(tokenId);
      return owner.toLowerCase() === walletAddress.toLowerCase();
    } catch {
      try {
        const contract = new ethers.Contract(contractAddress, this.NFT_ABI, this.provider);
        const balance = await contract.balanceOf(walletAddress, tokenId);
        return balance.gt(0);
      } catch (innerError: any) {
        console.error('Error verifying NFT ownership:', innerError);
        return false;
      }
    }
  }

  async transferNFT(
    fromAddress: string,
    toAddress: string,
    contractAddress: string,
    tokenId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenType?: string,
  ): Promise<Transaction> {
    const transactionId = uuidv4();

    try {
      if (!ethers.utils.isAddress(fromAddress) || !ethers.utils.isAddress(toAddress)) {
        throw new BadRequestException('Invalid addresses');
      }

      const { error: insertError } = await this.supabase
        .from('transactions')
        .insert({
          id: transactionId,
          from_address: fromAddress.toLowerCase(),
          to_address: toAddress.toLowerCase(),
          contract_address: contractAddress,
          token_id: tokenId,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new Error('Failed to create transaction record');
      }

      this.clearCache(fromAddress);
      this.clearCache(toAddress);

      return {
        id: transactionId,
        fromAddress,
        toAddress,
        contractAddress,
        tokenId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      await this.supabase
        .from('transactions')
        .update({
          status: 'failed',
          error: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      throw error;
    }
  }

  async getTransactionStatus(transactionId: string): Promise<Transaction> {
    const { data: transaction, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      throw new NotFoundException('Transaction not found');
    }

    this.clearCache(transaction.fromAddress);
    this.clearCache(transaction.toAddress);

    return {
      id: transaction.id,
      fromAddress: transaction.from_address,
      toAddress: transaction.to_address,
      contractAddress: transaction.contract_address,
      tokenId: transaction.token_id,
      status: transaction.status,
      txHash: transaction.tx_hash,
      error: transaction.error,
      createdAt: new Date(transaction.created_at),
      updatedAt: new Date(transaction.updated_at),
    };
  }

  async clearCache(walletAddress: string) {
    const cacheKeyFromAddress = `${NftService.CACHE_KEY_PREFIX}${walletAddress}*`;
    const cacheKeyTransactionsHistoryFromAddress = `${this.TRANSACTIONS_HISTORY}${walletAddress}*`;

    const keysFromAddress = await this.cacheService.keys(cacheKeyFromAddress);
    const keysTransactionsHistory = await this.cacheService.keys(
      cacheKeyTransactionsHistoryFromAddress,
    );
    const keys = [...keysFromAddress, ...keysTransactionsHistory];

    this.logger.log(`Clearing cache for wallet ${walletAddress}: keys [${keys.join(', ')}]`);

    await Promise.all(
      keys.map(async key => {
        await this.cacheService.del(key);
        this.logger.log(`Deleted cache key: ${key}`);
      }),
    );

    const remainingKeysFromAddress = await this.cacheService.keys(cacheKeyFromAddress);
    const remainingKeysTransactionsHistory = await this.cacheService.keys(
      cacheKeyTransactionsHistoryFromAddress,
    );
    const remainingKeys = [...remainingKeysFromAddress, ...remainingKeysTransactionsHistory];

    if (remainingKeys.length > 0) {
      this.logger.error(
        `Cache clearance incomplete for wallet ${walletAddress}. Remaining keys: ${remainingKeys.join(', ')}`,
      );
    } else {
      this.logger.log(`Cache successfully cleared for wallet ${walletAddress}`);
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    updateDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.getTransactionStatus(transactionId);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const { error: updateError } = await this.supabase
      .from('transactions')
      .update({
        status: updateDto.status,
        tx_hash: updateDto.txHash,
        error: updateDto.error,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateError) {
      throw new Error('Failed to update transaction status');
    }

    await this.clearCache(transaction.fromAddress);
    await this.clearCache(transaction.toAddress);

    return this.getTransactionStatus(transactionId);
  }
}
