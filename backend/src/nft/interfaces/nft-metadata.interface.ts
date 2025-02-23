export interface NFTMetadata {
  id: string;
  contractAddress: string;
  tokenId: string;
  metadata: any;
  lastUpdated: Date;
  lastChecked: Date;
  imageUrl?: string;
  name?: string;
  description?: string;
}
