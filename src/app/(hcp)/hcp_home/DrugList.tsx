import React from 'react';
import { usePaginatedDrugs } from '../../../components/hooks/usePaginatedDrugs';
import DrugListComponent from '../../../components/DrugItemList';

const DrugList: React.FC<{ filter: string }> = ({ filter }) => {
  return <DrugListComponent filter={filter} usePaginatedDrugs={usePaginatedDrugs} pushPath="/hcp_dynamic/drug-details/[id]" />;
};

export default DrugList;
