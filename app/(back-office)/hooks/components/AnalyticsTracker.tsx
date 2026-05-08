// components/AnalyticsTracker.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { sendEvent } from '@/lib/gtag';

export function AnalyticsTracker() {
  const pathname = usePathname();

  // Tracker le scroll profondeur
  useEffect(() => {
    let currentMaxDepth = 0;

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > currentMaxDepth) {
        currentMaxDepth = scrollPercentage;
        
        // Tracker les paliers de scroll
        if ([25, 50, 75, 100].includes(currentMaxDepth)) {
          sendEvent('scroll_depth', {
            event_category: 'engagement',
            event_label: `${currentMaxDepth}%`,
            value: currentMaxDepth,
            page_path: pathname,
          });
        }
      }
    };

    // Throttle pour optimiser les performances
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [pathname]);

  return null;
}