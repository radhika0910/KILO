// components/AnimatedSplashScreen.tsx — Premium animated entry for KILO

import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withTiming,
  runOnJS,
  FadeIn,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Typography, Radius } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

interface Props {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: Props) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  
  // Liquid Card Animations
  const liquidRotate = useSharedValue(0);
  const liquidScale = useSharedValue(0.8);
  const liquidBorderRadius = useSharedValue(Radius.xxl);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 12 });
    
    // Liquid Movement
    liquidRotate.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
    liquidScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 3000 }),
        withTiming(0.9, { duration: 3000 })
      ),
      -1,
      true
    );

    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    taglineTranslateY.value = withDelay(800, withSpring(0));

    // Finish after 3 seconds to show off the effect
    setTimeout(() => {
      runOnJS(onAnimationFinish)();
    }, 3000);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const liquidStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${liquidRotate.value}deg` },
      { scale: liquidScale.value }
    ],
    opacity: opacity.value * 0.6,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Decorative Background Glows */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.glow, { top: '15%', left: '-10%', backgroundColor: '#8B5CF625' }]} />
        <View style={[styles.glow, { bottom: '15%', right: '-10%', backgroundColor: '#34D39915' }]} />
      </View>

      <View style={styles.logoWrapper}>
        {/* Liquid Card at the back */}
        <Animated.View style={[styles.liquidCard, liquidStyle]} />
        
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>KILO</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>Track. Transform. Triumph.</Text>
        <View style={styles.loaderBarContainer}>
          <Animated.View 
            entering={FadeIn.delay(1000)}
            style={styles.loaderBar} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidCard: {
    position: 'absolute',
    width: 280,
    height: 280,
    backgroundColor: '#8B5CF620',
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#8B5CF640',
    // Organic liquid shape feel via shadow and border
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 10,
    marginLeft: 10,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    letterSpacing: 2,
    fontWeight: '500',
    marginBottom: 24,
  },
  loaderBarContainer: {
    width: 120,
    height: 3,
    backgroundColor: '#1E1E2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B5CF6',
  }
});
