import { useState, useCallback } from 'react';
import { getFileAccess } from '../utils/storage/access';
import toast from 'react-hot-toast';
import type { UrlOptions } from '../utils/storage/types';

export const useFileAccess = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getFileUrl = useCallback(async (path: string, options?: UrlOptions): Promise<string | null> => {
    if (!path) {
      toast.error('Invalid file path');
      return null;
    }

    setIsLoading(true);

    try {
      const { url } = await getFileAccess(path, options);
      return url;
    } catch (error: any) {
      console.error('File access error:', error);
      toast.error('Unable to access file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openFile = useCallback(async (path: string, newTab = false): Promise<boolean> => {
    const url = await getFileUrl(path);
    
    if (url && newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
    
    return false;
  }, [getFileUrl]);

  return {
    isLoading,
    openFile,
    getFileUrl
  };
};