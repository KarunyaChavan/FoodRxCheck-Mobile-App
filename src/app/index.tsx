import { ActivityIndicator, Text, View } from "react-native";
import { Redirect, Link, Stack } from "expo-router";
import { useAuth } from "../provider/AuthProvider";


export default function Index() {
  const { session, loading,isAdmin,isHcp} = useAuth();
  
  if (loading) {
    return <ActivityIndicator />;
  }
  if (!session) {
    return <Redirect href={'/main'} />;
  }
  if(session && isHcp ){
    return <Redirect href={'/(hcp)/hcp_home/DrugList'} />;
  }
  return (
    <Redirect href={'/main'} />
  );
}