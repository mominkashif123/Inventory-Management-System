import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, shadows, borderRadius, spacing, typography } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function RingWidget({ 
  value = 0, 
  total = 100, 
  size = 140, 
  stroke = 14, 
  title = 'Summary', 
  subtitle,
  color = colors.primary,
  animated = true,
  glow = false,
  showPercentage = true,
  style
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const pct = Math.min(100, Math.max(0, (value / total) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  useEffect(() => {
    if (animated) {
      // Simple entrance animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [animated]);

  return (
    <Animated.View style={[
      styles.container, 
      { 
        width: size, 
        height: size,
        transform: [{ scale: scaleAnim }],
      },
      style
    ]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.primaryLight} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.surfaceLight} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.surface} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Background circle with gradient */}
        <Circle 
          cx={size/2} 
          cy={size/2} 
          r={radius} 
          stroke="url(#backgroundGradient)" 
          strokeWidth={stroke} 
          fill="none"
          opacity={0.3}
        />
        
        {/* Progress circle with gradient */}
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeDasharray={`${dash}, ${circumference}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
          fill="none"
          opacity={0.9}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Text style={styles.value}>
            {String(Math.round(pct || 0))}%
          </Text>
        )}
        <Text style={styles.title}>{String(title || 'Summary')}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{String(subtitle)}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...shadows.medium,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  value: {
    fontSize: typography.h2.fontSize,
    fontWeight: '800',
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.captionBold.fontSize,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.small.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
});




