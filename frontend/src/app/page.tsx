import { Metadata } from 'next';
import { generateMetadata } from '@/config/seo/metadata';
import HomePageComponent from '@/components/pages/HomePage';

export const metadata: Metadata = generateMetadata({
  title: 'Web3 Wallet Platform | Manage Your NFTs with Ease',
  description:
    'Securely manage your NFTs on Polygon. Connect your wallet to view and transfer your digital assets with ease.',
  path: '/',
});

export default function HomePage() {
  return <HomePageComponent />;
}
