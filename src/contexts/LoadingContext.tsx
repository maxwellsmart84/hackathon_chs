'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  // Page transition loading
  isPageLoading: boolean;

  // Form submission loading
  isFormLoading: boolean;
  formLoadingMessage: string;

  // Global loading state (true if any loading is happening)
  isLoading: boolean;

  // Methods to control form loading
  setFormLoading: (loading: boolean, message?: string) => void;

  // Method to trigger programmatic page loading
  setPageLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoadingState] = useState(false);
  const [isFormLoading, setIsFormLoadingState] = useState(false);
  const [formLoadingMessage, setFormLoadingMessage] = useState('Loading...');

  const router = useRouter();
  const pathname = usePathname();

  // Track page transitions automatically
  useEffect(() => {
    const handleStart = () => {
      console.log('Page transition started');
      setIsPageLoadingState(true);
    };

    const handleComplete = () => {
      console.log('Page transition completed');
      setIsPageLoadingState(false);
    };

    // For App Router, we need to detect navigation differently
    // We'll use a timeout-based approach since App Router doesn't have router events
    let timeoutId: NodeJS.Timeout;

    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    // Wrap router methods to detect navigation
    router.push = (...args: Parameters<typeof router.push>) => {
      handleStart();
      timeoutId = setTimeout(handleComplete, 1000); // Fallback timeout
      return originalPush.apply(router, args);
    };

    router.replace = (...args: Parameters<typeof router.replace>) => {
      handleStart();
      timeoutId = setTimeout(handleComplete, 1000); // Fallback timeout
      return originalReplace.apply(router, args);
    };

    router.back = (...args: Parameters<typeof router.back>) => {
      handleStart();
      timeoutId = setTimeout(handleComplete, 1000); // Fallback timeout
      return originalBack.apply(router, args);
    };

    router.forward = (...args: Parameters<typeof router.forward>) => {
      handleStart();
      timeoutId = setTimeout(handleComplete, 1000); // Fallback timeout
      return originalForward.apply(router, args);
    };

    return () => {
      // Restore original methods
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router]);

  // Reset page loading when pathname changes (navigation completed)
  useEffect(() => {
    setIsPageLoadingState(false);
  }, [pathname]);

  const setFormLoading = useCallback((loading: boolean, message = 'Loading...') => {
    setIsFormLoadingState(loading);
    setFormLoadingMessage(message);
  }, []);

  const setPageLoading = useCallback((loading: boolean) => {
    setIsPageLoadingState(loading);
  }, []);

  const isLoading = isPageLoading || isFormLoading;

  const value: LoadingContextType = {
    isPageLoading,
    isFormLoading,
    formLoadingMessage,
    isLoading,
    setFormLoading,
    setPageLoading,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for form submissions
export function useFormSubmission() {
  const { setFormLoading } = useLoading();

  const submitForm = useCallback(
    async <T,>(submitFn: () => Promise<T>, loadingMessage = 'Submitting...'): Promise<T> => {
      setFormLoading(true, loadingMessage);
      try {
        const result = await submitFn();
        return result;
      } finally {
        setFormLoading(false);
      }
    },
    [setFormLoading]
  );

  return { submitForm };
}
