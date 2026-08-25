import React, { useState } from 'react';
import { Music } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackGradient?: string;
  iconClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackGradient = 'from-zinc-800 to-zinc-950',
  iconClassName = 'w-5 h-5 text-zinc-500',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${fallbackGradient} ${className}`}
        title={alt}
      >
        <Music className={iconClassName} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} animate-pulse flex items-center justify-center`}>
          <Music className={iconClassName} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
        loading="lazy"
        {...props}
      />
    </div>
  );
};
