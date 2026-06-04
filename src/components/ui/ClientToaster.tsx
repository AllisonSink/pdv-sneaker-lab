'use client';

import React, { useState, useEffect } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export default function ClientToaster() {
  const [position, setPosition] = useState<'top-right' | 'top-center'>('top-right');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // md breakpoint in Tailwind is 768px.
      // If screen is smaller than md (768px), align top-center.
      // Else, align top-right.
      if (window.innerWidth < 768) {
        setPosition('top-center');
      } else {
        setPosition('top-right');
      }
    };

    // Run on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SonnerToaster 
      position={position} 
      richColors 
      closeButton 
      // Safe top margin on mobile (70px) so toasts are fully visible below the top navigation bar/header
      style={{
        top: position === 'top-center' ? '70px' : '16px',
        right: '16px',
      }}
    />
  );
}
