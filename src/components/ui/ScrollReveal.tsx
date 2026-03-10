'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  stagger?: boolean;
  delay?: number;
}

export default function ScrollReveal({
  children,
  className,
  direction = 'up',
  stagger = false,
  delay = 0,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const directionClass =
    direction === 'left'
      ? 'reveal-left'
      : direction === 'right'
        ? 'reveal-right'
        : 'reveal-hidden';

  return (
    <div
      ref={ref}
      className={cn(
        directionClass,
        isVisible && 'reveal-visible',
        stagger && 'stagger-children',
        className
      )}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
