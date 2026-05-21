/**
 * @file EmptyState component
 * @description Reusable component to display standardized empty collection views.
 */


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


import Colors from '../../constant/Colors';

type EmptyStateProps = {
  message: string;
  description?: string;
};

/**
 * Reusable EmptyState component to display standardized empty collection views.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ message, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  message: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default EmptyState;
