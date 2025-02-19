import { View, Text,Alert, Linking, StyleSheet } from 'react-native'
import React from 'react'
import * as Clipboard from 'expo-clipboard';
const parseAndRenderText = (text: string) => {
  if (!text) {
    return null;
  }

  const copyToClipboard = (text :any) => {
    Clipboard.setStringAsync(text);

  };
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <Text key={index} style={styles.linkText} onLongPress={() => url && copyToClipboard(url)} onPress={() => Linking.openURL(url)}>
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

const styles = StyleSheet.create({
  linkText: {
    fontSize: 16,
    color: '#6200ee',
    textDecorationLine: 'underline',
  },
});

export default parseAndRenderText;