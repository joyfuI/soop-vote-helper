import { useCallback, useRef } from 'react';

import type { DotPath, DotPathValue, StoreType } from '../types';
import {
  useDeleteStoreQuery,
  useGetStoreQuery,
  usePutStoreQuery,
} from './useStoreQuery';

type UseStoreReturn<T, U = T> = readonly [
  T,
  (newValue: U | ((oldValue: T) => U)) => void,
  () => void,
];

function useStore<K extends DotPath<StoreType>>(
  key: K,
): UseStoreReturn<
  DotPathValue<StoreType, K> | undefined,
  DotPathValue<StoreType, K>
>;
function useStore<K extends DotPath<StoreType>>(
  key: K,
  defaultValue: DotPathValue<StoreType, K>,
): UseStoreReturn<DotPathValue<StoreType, K>>;
// key는 electron/store.ts에서 먼저 선언해둘 것
function useStore<K extends DotPath<StoreType>>(
  key: K,
  defaultValue?: DotPathValue<StoreType, K>,
) {
  const { data, isFetched } = useGetStoreQuery(key);
  const { mutate: putMutate } = usePutStoreQuery(key);
  const { mutate: deleteMutate } = useDeleteStoreQuery(key);

  const storedValue = isFetched ? data : defaultValue;
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (
      newValue:
        | DotPathValue<StoreType, K>
        | ((
            oldValue: DotPathValue<StoreType, K>,
          ) => DotPathValue<StoreType, K>),
    ) => {
      const value =
        typeof newValue === 'function'
          ? (
              newValue as (
                oldValue: DotPathValue<StoreType, K> | undefined,
              ) => DotPathValue<StoreType, K>
            )(storedValueRef.current)
          : newValue;
      putMutate(value);
    },
    [putMutate],
  );

  const delValue = useCallback(() => {
    deleteMutate();
  }, [deleteMutate]);

  return [storedValue, setValue, delValue] as const;
}

export default useStore;
