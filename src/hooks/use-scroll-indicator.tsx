import { useEffect, useRef, useState, useCallback } from 'react';

export function useScrollIndicator() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isScrolledLeft, setIsScrolledLeft] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollRef.current;
      setCanScroll(scrollWidth > clientWidth);
      setIsScrolledLeft(scrollLeft > 5);
    }
  }, []);

  const scrollToActiveTab = useCallback((activeTab: string) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const activeElement = container.querySelector('[data-slot="tabs-trigger"][data-state="active"]') as HTMLElement;
      if (activeElement) {
        const elementLeft = activeElement.offsetLeft;
        const elementWidth = activeElement.offsetWidth;
        const containerWidth = container.clientWidth;
        const targetScroll = elementLeft - (containerWidth - elementWidth) / 2;
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setIsScrolledLeft(scrollRef.current.scrollLeft > 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [checkScroll, handleScroll]);

  return { scrollRef, canScroll, isScrolledLeft, scrollToActiveTab };
}