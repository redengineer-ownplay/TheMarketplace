export const formatTokenUrl = (uri: string): string => {
  if (!uri) return '';

  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  if (uri.startsWith('data:')) {
    return uri;
  }

  if (uri.startsWith('/ipfs/')) {
    return `https://ipfs.io${uri}`;
  }

  if (!uri.startsWith('http')) {
    return `https://${uri}`;
  }

  return uri;
}
