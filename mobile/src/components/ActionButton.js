import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../utils/theme';

const { width } = Dimensions.get('window');

const ActionButton = ({
  title,
  onPress,
  icon,
  iconPosition = 'left', // 'left', 'right', 'top', 'bottom'
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  animated = true,
  glow = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated && !disabled && !loading) {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && !disabled && !loading) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          gradient: colors.gradients.secondary,
          textColor: colors.text,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      case 'outline':
        return {
          gradient: ['transparent', 'transparent'],
          textColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          gradient: ['rgba(255, 107, 0, 0.1)', 'rgba(255, 107, 0, 0.05)'],
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      default:
        return {
          gradient: colors.gradients.primary,
          textColor: colors.textInverse,
          borderColor: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.captionBold.fontSize,
          iconSize: 16,
          borderRadius: borderRadius.md,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          fontSize: typography.h4.fontSize,
          iconSize: 24,
          borderRadius: borderRadius.xl,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          fontSize: typography.bodyBold.fontSize,
          iconSize: 20,
          borderRadius: borderRadius.lg,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

    const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons 
        name={String(icon || 'help-circle')}
        size={sizeStyles.iconSize}
        color={variantStyles.textColor}
        style={[
          iconPosition === 'right' && { marginLeft: spacing.sm },
          iconPosition === 'left' && { marginRight: spacing.sm },
          iconPosition === 'top' && { marginBottom: spacing.xs },
          iconPosition === 'bottom' && { marginTop: spacing.xs },
        ]}
      />
    );
  };

  const renderContent = () => {
    const isVertical = iconPosition === 'top' || iconPosition === 'bottom';
    
    return (
      <View style={[
        styles.content,
        isVertical && styles.verticalContent,
        fullWidth && styles.fullWidth,
      ]}>
        {iconPosition === 'left' && renderIcon()}
        {iconPosition === 'top' && renderIcon()}
        
        <Text style={[
          styles.text,
          { 
            fontSize: sizeStyles.fontSize,
            color: variantStyles.textColor,
          },
          textStyle,
        ]}>
          {loading ? 'Loading...' : String(title || 'Button')}
        </Text>
        
        {iconPosition === 'right' && renderIcon()}
        {iconPosition === 'bottom' && renderIcon()}
      </View>
    );
  };

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }] },
      fullWidth && styles.fullWidthContainer,
      style,
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          {
            borderRadius: sizeStyles.borderRadius,
            borderColor: variantStyles.borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <BlurView intensity={15} style={styles.blurContainer}>
          <LinearGradient
            colors={variantStyles.gradient}
            style={[
              styles.gradient,
              {
                paddingVertical: sizeStyles.paddingVertical,
                paddingHorizontal: sizeStyles.paddingHorizontal,
                borderRadius: sizeStyles.borderRadius,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderContent()}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: borderRadius.lg,
  },
  gradient: {
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContent: {
    flexDirection: 'column',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  fullWidthContainer: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
});

export default ActionButton;
