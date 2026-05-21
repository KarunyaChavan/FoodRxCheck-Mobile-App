/**
 * @file Provides the shared primary pressable button component.
 */

import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ButtonProps = {
  text: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

/**
 * Renders the app's shared filled button while forwarding native press props.
 */
const Button = forwardRef<View | null, ButtonProps>(function Button(
  { text, ...pressableProps },
  ref,
) {
  return (
    <Pressable ref={ref} {...pressableProps} style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    alignItems: 'center',
    borderRadius: 100,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default Button;
