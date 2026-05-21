/**
 * @file Shows HCP drug interaction details for a selected drug.
 */

import { Redirect } from 'expo-router';
import React from 'react';

import DrugInteractionList from '../../../components/DrugInteractionList';
import { useAuth } from '../../../provider/AuthProvider';

/**
 * Renders HCP interaction details for the selected drug route.
 */
const DrugDetails: React.FC = () => {
  const { session } = useAuth();
  if (!session) {
    return <Redirect href={'/'} />;
  }
  return <DrugInteractionList tableName="interactions" />;
};

export default DrugDetails;
