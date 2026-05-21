/**
 * @file Fetches paginated HCP drug records using the decoupled service layer.
 */

import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '../../constant/QueryKeys';
import { fetchPaginatedDrugs } from '../../services/api/drugs';

const LIMIT = 50;

/**
 * Fetches one page of HCP drug records from the service layer.
 */
const fetchDrugs = async ({ pageParam = 0 }) => {
  const data = await fetchPaginatedDrugs(pageParam, LIMIT);
  return { data, nextOffset: data.length ? pageParam + LIMIT : null };
};

/**
 * Returns an infinite query hook for the HCP drug catalogue.
 */
export const usePaginatedDrugs = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.drugs.paginated(0, LIMIT),
    queryFn: fetchDrugs,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};
