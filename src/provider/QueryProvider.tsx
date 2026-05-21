/**
 * @file Provides the TanStack Query client to the application tree.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const client = new QueryClient();

/**
 * Supplies a shared TanStack Query client to all data-fetching components.
 */
export default function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
