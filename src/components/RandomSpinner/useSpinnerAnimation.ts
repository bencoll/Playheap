import { useRef, useCallback, useState } from 'react';

// Always scroll through at least this many items before landing
const MIN_ITEMS_TO_SCROLL = 30;

interface UseSpinnerAnimationProps {
  itemCount: number;
  itemHeight: number;
  onComplete: (winnerIndex: number) => void;
}

interface UseSpinnerAnimationReturn {
  position: number;
  isSpinning: boolean;
  startSpin: () => void;
  reset: () => void;
  totalCopies: number;
}

export function useSpinnerAnimation({
  itemCount,
  itemHeight,
  onComplete,
}: UseSpinnerAnimationProps): UseSpinnerAnimationReturn {
  // Calculate how many copies we need to scroll through MIN_ITEMS_TO_SCROLL items
  // Plus extra for: 1 set before start, scroll distance, 2 sets after landing for viewport buffer
  // Handle itemCount = 0 to avoid division by zero
  const totalCopies =
    itemCount === 0
      ? 1
      : Math.max(
          6,
          Math.ceil((MIN_ITEMS_TO_SCROLL + itemCount * 4) / itemCount)
        );

  // Start with enough items above to fill the viewport (need ~3 items above center)
  // Use at least 3 items worth of offset, or one full set, whichever is larger
  const minItemsAbove = 3;
  const initialPosition = Math.max(minItemsAbove * itemHeight, itemCount * itemHeight);
  const [position, setPosition] = useState(initialPosition);
  const [isSpinning, setIsSpinning] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const winnerIndexRef = useRef(0);

  const cancelAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startSpin = useCallback(() => {
    if (itemCount === 0) return;

    cancelAnimation();

    const totalHeight = itemCount * itemHeight;
    // Start with enough items above to fill the viewport
    const startPosition = Math.max(minItemsAbove * itemHeight, totalHeight);

    // Reset position to start
    setPosition(startPosition);

    // Pick a random winner
    winnerIndexRef.current = Math.floor(Math.random() * itemCount);
    const winnerOffset = winnerIndexRef.current * itemHeight;

    // Calculate target: scroll through MIN_ITEMS_TO_SCROLL items, then land on winner
    // We need to end up at a position that shows the winner
    const itemsToScroll = MIN_ITEMS_TO_SCROLL;
    const scrollDistance = itemsToScroll * itemHeight;

    // Round up to the next complete rotation that includes the winner
    const rotationsForScroll = Math.ceil(scrollDistance / totalHeight);
    let targetPosition =
      startPosition + rotationsForScroll * totalHeight + winnerOffset;

    // Ensure we leave room for items below (at least 3 items buffer at the end)
    const itemsBufferBelow = 3;
    const maxSafePosition =
      totalCopies * totalHeight - itemsBufferBelow * itemHeight;
    while (targetPosition > maxSafePosition && targetPosition > startPosition + totalHeight) {
      // Reduce by one rotation to stay within safe bounds
      targetPosition -= totalHeight;
    }

    // Consistent duration since we're always scrolling similar number of items
    const duration = 3000;

    startTimeRef.current = 0;
    setIsSpinning(true);

    const animationDistance = targetPosition - startPosition;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentPosition = startPosition + eased * animationDistance;
      setPosition(currentPosition);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setPosition(targetPosition);
        setIsSpinning(false);
        animationRef.current = null;
        onComplete(winnerIndexRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [itemCount, itemHeight, onComplete, cancelAnimation]);

  const reset = useCallback(() => {
    cancelAnimation();
    const minAbove = 3;
    setPosition(Math.max(minAbove * itemHeight, itemCount * itemHeight));
    setIsSpinning(false);
  }, [cancelAnimation, itemCount, itemHeight]);

  return {
    position,
    isSpinning,
    startSpin,
    reset,
    totalCopies,
  };
}
