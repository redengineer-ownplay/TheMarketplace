import { Metadata } from 'next';
import { generateMetadata } from '@/config/seo/metadata';
import ProfilePageComponent from '@/components/pages/ProfilePage';

export const metadata: Metadata = generateMetadata({
  title: 'Profile | Web3 Wallet Platform',
  description:
    'Manage your Web3 wallet profile, update your username, and view transaction history.',
  path: '/profile',
});

export default function ProfilePage() {
  return <ProfilePageComponent />;
}
