import { useState, useEffect } from 'react';

export function useStoreData<T>(
  fetcher: (storeId: number) => Promise<T>,
  storeId: number,
  refreshTrigger: number,
  initialValue: T,
) {
  const [data, setData] = useState<T>(initialValue);

  useEffect(() => {
    let active = true;
    fetcher(storeId).then(result => {
      if (active) setData(result);
    });
    return () => { active = false; };
  }, [fetcher, storeId, refreshTrigger]);

  return [data, setData] as const;
}
