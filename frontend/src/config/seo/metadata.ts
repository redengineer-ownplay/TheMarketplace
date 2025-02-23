import { Metadata } from 'next';

type MetadataProps = {
  title?: string;
  description?: string;
  path?: string;
};

export function generateMetadata({
  title = 'Web3 Wallet Platform',
  description = 'Manage your NFTs and tokens with our Web3 Wallet Platform',
  path = '',
}: MetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://web3wallet.example.com';

  return {
    title,
    description,
    keywords: ['NFT', 'Web3', 'Wallet', 'Polygon', 'Blockchain', 'Ethereum'],
    authors: [{ name: 'Web3 Wallet Team' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#000000',
    openGraph: {
      type: 'website',
      url: `${baseUrl}${path}`,
      title,
      description,
      siteName: 'Web3 Wallet Platform',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/twitter-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  };
}
