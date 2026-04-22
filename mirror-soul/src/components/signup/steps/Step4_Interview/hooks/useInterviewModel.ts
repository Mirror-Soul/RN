import { Asset } from 'expo-asset';
import { useEffect, useState } from 'react';

/**
 * 3D 모델 에셋을 로드하고 로컬 URI를 관리하는 커스텀 훅
 */
export function useInterviewModel(module: any) {
  const [modelUri, setModelUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAsset() {
      try {
        setError(null);
        setIsLoading(true);
        const asset = Asset.fromModule(module);
        await asset.downloadAsync();

        if (isMounted) {
          if (asset.localUri) {
            setModelUri(asset.localUri);
          } else {
            throw new Error('Failed to resolve local URI for the 3D model.');
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error loading model'));
          setIsLoading(false);
        }
      }
    }

    loadAsset();

    return () => {
      isMounted = false;
    };
  }, [module]);

  return { modelUri, isLoading, error };
}
