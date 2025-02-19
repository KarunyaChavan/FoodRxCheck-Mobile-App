import FoodSearchComponent from '../../components/FoodSearch';

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
