/**
 * @file Mounts the healthcare professional food-drug search route.
 */

import FoodSearchComponent from '../../components/FoodSearch';

/**
 * Renders food-drug search configured for HCP interaction data.
 */
const FoodSearchScreen = () => {
  return (
    <FoodSearchComponent
      placeholder="Search food interactions..."
      routePath="/hcp_dynamic/drug-details/[id]"
      isHcp={true}
    />
  );
};

export default FoodSearchScreen;
