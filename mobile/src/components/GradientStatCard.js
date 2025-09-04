// components/GradientStatCard.jsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../utils/theme';

const { width } = Dimensions.get('window');

const GradientStatCard = ({ 
  title, 
  value, 
  icon, 
  color = colors.primary,
  subtitle, 
  trend, 
  onPress,
  style,
  size = 'medium', // 'small', 'medium', 'large'
  animated = true,
  glow = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Simple entrance animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [animated]);

  const handlePress = () => {
    if (animated) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    if (onPress) onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          cardPadding: spacing.sm,
          iconSize: 20,
          valueSize: typography.h4.fontSize,
          titleSize: typography.caption.fontSize,
        };
      case 'large':
        return {
          cardPadding: spacing.lg,
          iconSize: 32,
          valueSize: typography.h1.fontSize,
          titleSize: typography.bodyBold.fontSize,
        };
      default:
        return {
          cardPadding: spacing.md,
          iconSize: 24,
          valueSize: typography.h3.fontSize,
          titleSize: typography.body.fontSize,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const shadowStyle = {
    ...shadows.medium,
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [shadows.medium.shadowOpacity, shadows.medium.shadowOpacity * 1.2],
    }),
    elevation: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [shadows.medium.elevation, shadows.medium.elevation * 1.1],
    }),
  };

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }] },
      shadowStyle,
      style
    ]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <BlurView intensity={25} style={styles.card}>
          <LinearGradient
            colors={[`${color}20`, 'rgba(18, 18, 18, 0.95)']}
            style={[styles.cardGradient, { padding: sizeStyles.cardPadding }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Background glow effect */}
            <LinearGradient
              colors={[`${color}15`, 'transparent']}
              style={styles.backgroundGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            {/* Header with icon and trend */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={String(icon || 'help-circle')} size={sizeStyles.iconSize} color="#000" />
              </View>
              {trend && (
                <View style={styles.trendContainer}>
                  <Ionicons 
                    name={String(trend > 0 ? "trending-up" : "trending-down")} 
                    size={16} 
                    color={trend > 0 ? colors.success : colors.error} 
                  />
                  <Text style={[
                    styles.trendText, 
                    { color: trend > 0 ? colors.success : colors.error }
                  ]}>
                    {String(Math.abs(trend || 0))}%
                  </Text>
                </View>
              )}
            </View>
            
            {/* Main content */}
            <View style={styles.content}>
              <Text style={[
                styles.value, 
                { fontSize: sizeStyles.valueSize }
              ]}>
                {String(value || '0')}
              </Text>
              <Text style={[styles.title, { fontSize: sizeStyles.titleSize }]}>
                {String(title || 'Stat')}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle}>{String(subtitle)}</Text>
              )}
            </View>
            
            {/* Accent line */}
            <View style={[styles.accent, { backgroundColor: color }]} />
            
            {/* Corner decoration */}
            <View style={[styles.cornerDecoration, { borderColor: color }]} />
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    minHeight: 120,
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    borderRadius: borderRadius.xl,
    position: 'relative',
    backgroundColor: 'transparent',
    minHeight: 120,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trendText: {
    fontSize: typography.smallBold.fontSize,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  content: {
    alignItems: 'flex-start',
  },
  value: {
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.small.fontSize,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  cornerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderTopWidth: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    opacity: 0.3,
  },
});

export default GradientStatCard;