import React from 'react';
import DrugInteractionList from '../../../components/DrugInteractionList';

const PatientDrugDetails: React.FC = () => {
return <DrugInteractionList tableName="patient_interactions" />;
};

export default PatientDrugDetails;