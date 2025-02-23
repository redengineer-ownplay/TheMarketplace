import type { Endpoint, QueryParams } from 'fetchff';
import { ApiResponse, NFTsResponse, TransactionStatus } from '@/types/api';

export interface NFTMethods {
  /**
   * Endpoint for retrieving user's NFTs
   */
  getNFTs: Endpoint<GetNFTsResponse, GetNFTsQueryParams, GetNFTsPathParams>;

  /**
   * Endpoint for getting transaction status
   */
  getTransactionStatus: Endpoint<
    GetTransactionStatusResponse,
    QueryParams,
    GetTransactionStatusPathParams
  >;

  /**
   * Endpoint for transferring NFT
   */
  transferNFT: Endpoint<
    TransferNFTResponse,
    QueryParams,
    TransferNFTPathParams,
    TransferNFTRequest
  >;

  /**
   * Endpoint for updating transaction status
   */
  updateTransactionStatus: Endpoint<
    GetTransactionStatusResponse,
    QueryParams,
    GetTransactionStatusPathParams,
    UpdateTransactionStatusRequest
  >;
}

export interface GetNFTsQueryParams {
  limit?: number;
  offset?: number;
}

export interface GetNFTsPathParams {
  walletAddress: string;
}

export interface GetTransactionStatusPathParams {
  id: string;
}

export interface TransferNFTPathParams {
  walletAddress: string;
}

export interface TransferNFTRequest {
  recipient: string;
  contractAddress: string;
  tokenId: string;
  tokenType?: 'ERC721' | 'ERC1155';
}

export interface UpdateTransactionStatusRequest {
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  error?: string;
}

export type GetNFTsResponse = ApiResponse<NFTsResponse>;
export type GetTransactionStatusResponse = ApiResponse<TransactionStatus>;
export type TransferNFTResponse = ApiResponse<{
  id: string;
  fromAddress: string;
  toAddress: string;
  contractAddress: string;
  tokenId: string;
  status: 'pending';
  createdAt: string;
  updatedAt: string;
}>;
