import FoodSearchComponent from '../../components/FoodSearch';

const FoodSearchScreen = () => {
  return (
    <FoodSearchComponent
      placeholder="Search food interactions..."
      routePath="/hcp_dynamic/drug-details/[id]"
      interactionsTable="interactions"
      drugsTable="drugs"
    />
  );
};

export default FoodSearchScreen;
