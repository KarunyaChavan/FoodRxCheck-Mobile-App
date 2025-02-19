import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

interface ZoomableImageProps {
  imageUrl: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ imageUrl }) => {
  // Create a pinch gesture
  const pinchGesture = Gesture.Pinch();

  // Animated scale value
  const scale = useSharedValue(1);

  // Update scale value on pinch (mark as a worklet)
  pinchGesture.onUpdate((event) => {
    'worklet'; // Mark this as a worklet
    scale.value = event.scale;
  });

  // Animated style for the image
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value) }],
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default ZoomableImage;
