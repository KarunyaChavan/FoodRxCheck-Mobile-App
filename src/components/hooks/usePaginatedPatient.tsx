/**
 * @file Fetches paginated patient counselling drug records using the decoupled service layer.
 */

import { useInfiniteQuery } from '@tanstack/react-query';

import { queryKeys } from '../../constant/QueryKeys';
import { fetchPaginatedPatientDrugs } from '../../services/api/drugs';

const LIMIT = 50;

/**
 * Fetches one page of patient counselling records from the service layer.
 */
const fetchDrugs = async ({ pageParam = 0 }) => {
  const data = await fetchPaginatedPatientDrugs(pageParam, LIMIT);
  return { data, nextOffset: data.length ? pageParam + LIMIT : null };
};

/**
 * Returns an infinite query hook for patient counselling records.
 */
export const usePaginatedPatient = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.drugs.patientPaginated(0, LIMIT),
    queryFn: fetchDrugs,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
};
