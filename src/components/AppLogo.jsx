import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export default function AppLogo({ className = "w-6 h-6", containerClassName = "" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/icon.png"
        alt="Space App"
        onError={() => setImgError(true)}
        className={`${className} object-contain`}
      />
    );
  }

  // Elegant minimalist vector fallback if icon.png is not present yet
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.8} />
      <path d="M12 3v18M3 12h18" stroke="currentColor" strokeOpacity={0.3} />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity={0.9} />
    </svg>
  );
}
