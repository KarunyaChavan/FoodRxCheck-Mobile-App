/**
 * @file LoadingState component
 * @description Reusable loading spinner component.
 */


import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import Colors from '../../constant/Colors';
type LoadingStateProps = {
  size?: 'small' | 'large';
  color?: string;
};

/**
 * Reusable LoadingState component following professional UX standards.
 * Centers a spinner on the screen.
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'large',
  color = Colors.light.primary,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default LoadingState;
