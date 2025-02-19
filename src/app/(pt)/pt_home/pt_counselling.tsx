import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import DrugListComponent from '../../../components/DrugItemList';
import { usePaginatedPatient } from '../../../components/hooks/usePaginatedPatient';
import SearchBar from '../../../components/Searchbar';

const PtCounselling :React.FC<{ filter: string }> = ({ filter }) =>  {


  return (
    <View style={styles.container}>
      
     
      <DrugListComponent 
        filter={filter} 
        usePaginatedDrugs={usePaginatedPatient} 
        pushPath="/patient_dynamic/int-drugs-pt/[id]" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default PtCounselling;
