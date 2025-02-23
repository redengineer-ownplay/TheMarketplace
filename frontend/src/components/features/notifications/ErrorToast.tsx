'use client';

import { useEffect, useRef, memo } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store';

export const ErrorToast = memo(function ErrorToast() {
  const error = useAppStore().use.errors()
  const { toast } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error.length > 0 && error[0].message !== lastErrorRef.current) {
      lastErrorRef.current = error[0].message;
      
      toast({
        title: 'Error',
        description: error[0].message,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [error, toast]);

  return null;
})