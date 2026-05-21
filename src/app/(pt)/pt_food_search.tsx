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
      isHcp={false}
    />
  );
};

export default FoodSearchScreen;
