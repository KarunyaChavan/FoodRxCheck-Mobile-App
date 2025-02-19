import React from 'react';

import { Redirect } from 'expo-router';

import { useAuth } from '../../../provider/AuthProvider';

import DrugInteractionList from '../../../components/DrugInteractionList';

const DrugDetails: React.FC = () => {

  const {session} = useAuth();
    if(!session ){
      return <Redirect href={'/'} />;
    }
return <DrugInteractionList tableName="interactions" />;
};

export default DrugDetails;
