// components/GlassCard.jsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, shadows, borderRadius, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');

const GlassCard = ({ 
  children, 
  style, 
  intensity = 15, 
  colors: gradientColors = colors.gradients.glass,
  borderColor = 'rgba(255, 107, 0, 0.2)',
  onPress,
  animated = true,
  shadowLevel = 'medium',
  borderRadius: cardBorderRadius = borderRadius.xl,
  padding = spacing.md,
  margin = spacing.sm,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const handlePressIn = () => {
    if (onPress && animated) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress && animated) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const CardContent = () => (
    <BlurView intensity={intensity} style={[styles.card, { borderRadius: cardBorderRadius }, style]}>
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.cardGradient, 
          { 
            borderRadius: cardBorderRadius,
            borderColor,
            padding,
            margin,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );

  if (onPress) {
    return (
      <Animated.View style={[
        { transform: [{ scale: scaleAnim }] },
        shadows[shadowLevel]
      ]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.touchable}
        >
          <CardContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[shadows[shadowLevel]]}>
      <CardContent />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    borderWidth: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  touchable: {
    borderRadius: borderRadius.xl,
  },
});

export default GlassCard;