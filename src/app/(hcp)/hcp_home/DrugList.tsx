/**
 * @file Renders the HCP paginated drug list route content.
 */

import React from 'react';

import DrugListComponent from '../../../components/DrugItemList';
import { usePaginatedDrugs } from '../../../components/hooks/usePaginatedDrugs';

/**
 * Renders the HCP drug list using the shared paginated drug component.
 */
const DrugList: React.FC<{ filter: string }> = ({ filter }) => {
  return (
    <DrugListComponent
      filter={filter}
      usePaginatedDrugs={usePaginatedDrugs}
      pushPath="/hcp_dynamic/drug-details/[id]"
    />
  );
};

export default DrugList;
