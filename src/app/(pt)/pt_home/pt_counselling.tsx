/**
 * @file Lists patient food-drug counselling records.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import DrugListComponent from '../../../components/DrugItemList';
import { usePaginatedPatient } from '../../../components/hooks/usePaginatedPatient';

/**
 * Renders patient food-drug counselling results with shared pagination.
 */
const PtCounselling: React.FC<{ filter: string }> = ({ filter }) => {
  return (
    <View style={styles.container}>
      <DrugListComponent
        filter={filter}
        usePaginatedDrugs={usePaginatedPatient}
        pushPath="/patient_dynamic/int-drugs-pt/[id]"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default PtCounselling;
