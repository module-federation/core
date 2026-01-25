import { useCallback, useState } from 'react';
import type { BundleResult, SourceFile } from './bundler';

interface UseBundleResult {
  isBundling: boolean;
  bundleResult: BundleResult | null;
  handleBundle: (files: SourceFile[]) => Promise<BundleResult>;
}

export default function useBundle(): UseBundleResult {
  const [isBundling, setIsBundling] = useState(false);
  const [bundleResult, setBundleResult] = useState<BundleResult | null>(null);

  const handleBundle = useCallback(async (files: SourceFile[]) => {
    setIsBundling(true);
    try {
      const bundler = await import('./bundler');
      const result = await bundler.bundle(files);
      setBundleResult(result);
      return result;
    } finally {
      setIsBundling(false);
    }
  }, []);

  return { isBundling, bundleResult, handleBundle };
}
