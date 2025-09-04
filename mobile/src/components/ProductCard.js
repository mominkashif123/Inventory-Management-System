import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../utils/theme';

const { width } = Dimensions.get('window');

const ProductCard = ({
  product,
  onPress,
  onEdit,
  onDelete,
  animated = true,
  glow = false,
  style,
  showActions = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [animated]);

  const handlePressIn = () => {
    if (animated) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const getStockStatusColor = (stock) => {
    if (stock <= 0) return colors.error;
    if (stock <= 10) return colors.warning;
    return colors.success;
  };

  const getStockStatusText = (stock) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Animated.View style={[
      {
        transform: [{ scale: scaleAnim }],
      },
      shadows.medium,
      style,
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.container}
      >
        <BlurView intensity={20} style={styles.card}>
          <LinearGradient
            colors={colors.gradients.glass}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Product Image */}
            <View style={styles.imageContainer}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="cube-outline" size={40} color={colors.textSecondary} />
                </View>
              )}
              
              {/* Stock status badge */}
              <View style={[
                styles.stockBadge,
                { backgroundColor: getStockStatusColor(product.stock) }
              ]}>
                <Text style={styles.stockText}>
                  {getStockStatusText(product.stock)}
                </Text>
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.content}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              
              <Text style={styles.productCategory} numberOfLines={1}>
                {product.category || 'Uncategorized'}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ${parseFloat(product.price).toFixed(2)}
                </Text>
                <Text style={styles.stock}>
                  Stock: {product.stock}
                </Text>
              </View>

              {/* SKU */}
              <Text style={styles.sku}>
                SKU: {product.sku || 'N/A'}
              </Text>
            </View>

            {/* Action Buttons */}
            {showActions && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => onEdit && onEdit(product)}
                >
                  <Ionicons name="pencil" size={16} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete && onDelete(product)}
                >
                  <Ionicons name="trash" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
    borderRadius: borderRadius.xl,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    marginBottom: spacing.md,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  stockBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    ...shadows.small,
  },
  stockText: {
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    color: colors.textInverse,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  productName: {
    fontSize: typography.bodyBold.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  stock: {
    fontSize: typography.small.fontSize,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sku: {
    fontSize: typography.small.fontSize,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  actions: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  editButton: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});

export default ProductCard;
