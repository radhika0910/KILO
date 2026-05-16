// components/ui/Confetti.tsx — Lightweight Reanimated Confetti Effect

import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];
const NUM_PARTICLES = 40;

interface ParticleProps {
  id: number;
  onFinish?: () => void;
}

const Particle = ({ id, onFinish }: ParticleProps) => {
  const y = useSharedValue(-20);
  const x = useSharedValue(Math.random() * SCREEN_WIDTH);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(Math.random() * 0.5 + 0.5);
  
  const color = COLORS[id % COLORS.length];

  useEffect(() => {
    const duration = 2000 + Math.random() * 2000;
    const delay = Math.random() * 1000;

    y.value = withDelay(delay, withTiming(SCREEN_HEIGHT + 20, { 
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    }));

    x.value = withDelay(delay, withTiming(x.value + (Math.random() - 0.5) * 200, {
      duration
    }));

    rotate.value = withDelay(delay, withTiming(720, { duration }));
    
    opacity.value = withDelay(delay + duration * 0.8, withTiming(0, { duration: 500 }));

    if (onFinish && id === NUM_PARTICLES - 1) {
      setTimeout(() => {
        runOnJS(onFinish)();
      }, delay + duration);
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { translateX: x.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.particle, style]} />;
};

export default function Confetti({ onAnimationEnd }: { onAnimationEnd?: () => void }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} id={i} onFinish={onAnimationEnd} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
