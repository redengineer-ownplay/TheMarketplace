import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from 'src/features/nft/dto/pagination.dto';
import { CacheService } from 'src/core/cache/cache.service';

@Injectable()
export class TransactionService {
  public static readonly CACHE_KEY_PREFIX = 'TRANSACTIONS_HISTORY_';

  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient,
    private configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getTransactionsByAddress(walletAddress: string, { limit = 10, offset = 0 }: PaginationDto) {
    try {
      const cacheKey = `${TransactionService.CACHE_KEY_PREFIX}${walletAddress}_${limit}_${offset}`;

      const cachedNFTs = await this.cacheService.get(cacheKey);
      if (cachedNFTs) {
        return JSON.parse(cachedNFTs);
      }

      const [dbTx, chainTx] = await Promise.all([
        this.getDBTransactions(walletAddress),
        this.getChainTransactions(walletAddress),
      ]);

      const allTransactions = [...dbTx, ...chainTx].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const total = allTransactions.length;

      const paginatedTransactions = allTransactions.slice(offset, offset + limit);

      const response = {
        data: paginatedTransactions,
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      };

      await this.cacheService.set(cacheKey, JSON.stringify(response), 3600);

      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        data: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      };
    }
  }

  private async getDBTransactions(walletAddress: string) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .or(
        `from_address.eq.${walletAddress.toLowerCase()},to_address.eq.${walletAddress.toLowerCase()}`,
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching DB transactions:', error);
      return [];
    }

    return data || [];
  }

  private async getChainTransactions(walletAddress: string) {
    try {
      const polygonScanApiKey = this.configService.get<string>('POLYGON_SCAN_API_KEY');
      const response = await fetch(
        `https://api.polygonscan.com/api?module=account&action=tokennfttx&address=${walletAddress}&startblock=0&endblock=999999999&sort=desc&apikey=${polygonScanApiKey}`,
      );

      const data = await response.json();

      if (data.status !== '1' || !data.result) {
        return [];
      }

      return data.result.map((tx: any) => ({
        id: tx.hash,
        from_address: tx.from.toLowerCase(),
        to_address: tx.to.toLowerCase(),
        contract_address: tx.contractAddress.toLowerCase(),
        token_id: tx.tokenID,
        status: 'completed',
        tx_hash: tx.hash,
        created_at: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        updated_at: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching chain transactions:', error);
      return [];
    }
  }
}
