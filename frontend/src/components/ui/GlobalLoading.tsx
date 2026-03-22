import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import PageLoader from './PageLoader';

const MIN_DURATION = 400;
const FADE_OUT_DURATION = 300;

const GlobalLoading = () => {
  const fetchingCount = useIsFetching();
  const [shouldRender, setShouldRender] = useState(false);
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (fetchingCount > 0) {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (!shouldRender) {
        shownAtRef.current = Date.now();
        setShouldRender(true);
        requestAnimationFrame(() => {
          setVisible(true);
        });
      }

      return;
    }

    if (!shouldRender) {
      return;
    }

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const remaining = Math.max(0, MIN_DURATION - elapsed);

    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      hideTimeoutRef.current = null;

      fadeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        shownAtRef.current = null;
        fadeTimeoutRef.current = null;
      }, FADE_OUT_DURATION);
    }, remaining);

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [fetchingCount, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return <PageLoader visible={visible} />;
};

export default GlobalLoading;