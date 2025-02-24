import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const SafeImage = ({ src, alt, ...props }: ImageProps) => {
  const [error, setError] = useState(false);

  if (typeof src === 'string' && src.startsWith('ipfs://')) {
    src = `https://ipfs.io/ipfs/${src.replace('ipfs://', '')}`;
  }

  if (error) {
    return <div>Image failed to load</div>;
  }

  return <Image src={src} alt={alt} onError={() => setError(true)} {...props} />;
};

export default SafeImage;
