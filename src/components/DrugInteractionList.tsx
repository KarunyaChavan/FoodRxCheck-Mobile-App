/**
 * @file Renders interaction detail cards for a selected drug using decoupled api layer.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Platform } from 'react-native';

import Colors from '../constant/Colors';
import { queryKeys } from '../constant/QueryKeys';
import { fetchDrugInteractions } from '../services/api/interactions';
import { Interaction } from '../types/database.types';
import FdaSummarySection from './ui/FdaSummarySection';
import parseAndRenderText from '../utils/parsehttp';

interface DrugInteractionListProps {
  tableName: 'interactions' | 'patient_interactions';
}

/**
 * Shows expandable interaction rows for the selected drug and data table.
 */
const DrugInteractionList: React.FC<DrugInteractionListProps> = ({ tableName }) => {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});

  const { data: drugDetails } = useQuery<Interaction[]>({
    queryKey: queryKeys.interactions.byDrug(id!, tableName === 'interactions'),
    queryFn: () => fetchDrugInteractions(id!, tableName === 'interactions'),
    enabled: Boolean(id),
  });

  // Compute filtered interactions early so hooks are always called in the same order.
  const validDrugDetails = drugDetails?.filter((item) => item.food !== 'NA') || [];
  const hasValidInteractions = validDrugDetails.length > 0;

  /**
   * Toggles an interaction card between collapsed and expanded states.
   */
  const toggleExpansion = React.useCallback((index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  // Include counselling tips even when food interactions are 'NA'
  const dataWithCounsellingTips =
    tableName === 'patient_interactions' && drugDetails?.[0]?.counselling_tips
      ? [
          ...validDrugDetails,
          {
            drug_id: id!,
            food: 'No Food Drug Interaction Available',
            counselling_tips: drugDetails[0]?.counselling_tips,
            isCounsellingTips: true,
          },
        ]
      : validDrugDetails;

  /**
   * Renders one interaction row inside the FlatList.
   */
  const renderInteractionItem = React.useCallback(
    ({ item, index }: { item: Interaction; index: number }) => {
      const isExpanded = expandedItems[index];

      return (
        <View style={styles.card}>
          {item.isCounsellingTips ? (
            <>
              <Text style={styles.bold}>Counselling Tips:</Text>
              <Text style={styles.cardText}>{item.counselling_tips}</Text>
            </>
          ) : (
            <>
              <Pressable style={styles.touch} onPress={() => toggleExpansion(index)}>
                <Text style={styles.cardTitle}>{item.food}</Text>
                <FontAwesome
                  name="chevron-right"
                  size={15}
                  color={Colors.light.text}
                  style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                />
              </Pressable>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {item.mechanism_of_action && (
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Mechanism:</Text> {item.mechanism_of_action}
                    </Text>
                  )}
                  {item.severity && (
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Severity:</Text> {item.severity}
                    </Text>
                  )}
                  {item.management && (
                    <Text style={styles.cardText}>
                      <Text style={styles.bold}>Management:</Text> {item.management}
                    </Text>
                  )}
                  {item.reference && (
                    <View>
                      <Text style={styles.bold}>Reference:</Text>
                      {parseAndRenderText(item.reference)}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      );
    },
    [expandedItems, toggleExpansion],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                Food Drug Interaction
              </Text>
              <Text style={{ fontSize: 16, color: '#fff' }}>{name}</Text>
            </View>
          ),
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.drugInfo}>
        <Text style={styles.cardTitle}>
          {hasValidInteractions
            ? `${validDrugDetails.length} Food Interaction${validDrugDetails.length !== 1 ? 's' : ''}`
            : 'No Food Drug Interaction Available'}
        </Text>

        <FdaSummarySection queryText={name ?? id ?? ''} />
      </View>

      <FlatList
        data={dataWithCounsellingTips}
        keyExtractor={(item, index) => `${item.drug_id}-${item.food}-${index}`}
        renderItem={renderInteractionItem}
        extraData={expandedItems}
        initialNumToRender={6}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...Platform.select({ ios: { marginTop: 38 } }),
  },
  drugInfo: {
    padding: 20,
    backgroundColor: Colors.light.cardBackground,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 5px 16px rgba(15, 23, 42, 0.18)',
      },
      default: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
      },
    }),
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.light.text,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.light.textSecondary,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  expandedContent: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 5,
  },
  touch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default DrugInteractionList;
