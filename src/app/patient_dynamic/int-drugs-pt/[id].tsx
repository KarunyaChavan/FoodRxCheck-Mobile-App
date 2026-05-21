/**
 * @file Shows patient-facing interaction details for a selected drug.
 */

import React from 'react';

import DrugInteractionList from '../../../components/DrugInteractionList';

/**
 * Renders patient interaction details for a selected drug route.
 */
const PatientDrugDetails: React.FC = () => {
  return <DrugInteractionList tableName="patient_interactions" />;
};

export default PatientDrugDetails;
