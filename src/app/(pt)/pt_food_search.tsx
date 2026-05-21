/**
 * @file Mounts the patient food-drug search route.
 */

import FoodSearchComponent from '../../components/FoodSearch';

/**
 * Renders food-drug search configured for patient interaction data.
 */
const FoodSearchScreen = () => {
  return (
    <FoodSearchComponent
      placeholder="Search food interactions..."
      routePath="/patient_dynamic/int-drugs-pt/[id]"
      interactionsTable="patient_interactions"
      drugsTable="patient_drugs"
    />
  );
};

export default FoodSearchScreen;
