'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store';

export function ErrorToast() {
  const error = useAppStore().use.errors()
  const { toast } = useToast();

  useEffect(() => {
    if (error[0]) {
      toast({
        title: 'Error',
        description: error[0].message,
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [error, toast]);

  return null;
}
