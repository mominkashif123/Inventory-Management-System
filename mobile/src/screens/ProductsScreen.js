// ProductsScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  TouchableOpacity,
  TextInput,
  Text,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import api from '../services/authService';

const { width, height } = Dimensions.get('window');

// Filter Chip Component
const FilterChip = ({ label, value, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.filterChip,
          selected && styles.filterChipSelected
        ]}
        activeOpacity={0.8}
      >
        {selected && (
          <LinearGradient
            colors={['#FF6B00', '#FF8C00']}
            style={styles.filterChipGradient}
          >
            <Text style={[styles.filterChipText, styles.filterChipTextSelected]}>
              {label}
            </Text>
          </LinearGradient>
        )}
        {!selected && (
          <Text style={styles.filterChipText}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Product Card Component
const ProductCard = ({ product, onPress, onEdit }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
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
    if (onPress) onPress();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'accessories': return '#FF6B00';
      case 'merchandise': return '#4ADE80';
      case 'workshop': return '#F59E0B';
      default: return '#888';
    }
  };

  const getQuantityColor = (quantity, minQuantity) => {
    if (quantity <= 0) return '#EF4444';
    if (quantity <= minQuantity) return '#F59E0B';
    return '#4ADE80';
  };

  const typeColor = getTypeColor(product.type);
  const quantityColor = getQuantityColor(product.quantity, product.min_quantity);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <BlurView intensity={20} style={styles.productCard}>
          <LinearGradient
            colors={[`${typeColor}15`, 'rgba(0,0,0,0.8)']}
            style={styles.productCardGradient}
          >
            {/* Product Header */}
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description || 'No description available'}
                </Text>
                {product.part_number && (
                  <View style={styles.partNumberContainer}>
                    <Text style={styles.partNumberText}>#{product.part_number}</Text>
                  </View>
                )}
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.viewButton]}
                  onPress={onPress}
                >
                  <Ionicons name="eye-outline" size={16} color="#FF6B00" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={onEdit}
                >
                  <Ionicons name="pencil-outline" size={16} color="#4ADE80" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Product Stats */}
            <View style={styles.productStats}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: `${typeColor}20` }]}>
                    <Ionicons name="cube-outline" size={14} color={typeColor} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Type</Text>
                    <Text style={[styles.statValue, { color: typeColor }]}>
                      {product.type}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: `${quantityColor}20` }]}>
                    <Ionicons name="layers-outline" size={14} color={quantityColor} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Quantity</Text>
                    <Text style={[styles.statValue, { color: quantityColor }]}>
                      {product.quantity}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(96,165,250,0.2)' }]}>
                    <Ionicons name="location-outline" size={14} color="#60A5FA" />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Location</Text>
                    <Text style={styles.statValue}>{product.location}</Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(74,222,128,0.2)' }]}>
                    <Ionicons name="cash-outline" size={14} color="#4ADE80" />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Value</Text>
                    <Text style={styles.statValue}>${product.value || 0}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Low Stock Warning */}
            {product.quantity <= product.min_quantity && (
              <View style={styles.lowStockWarning}>
                <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                <Text style={styles.lowStockText}>Low stock - reorder needed</Text>
              </View>
            )}

            {/* Status Indicator */}
            <View style={[styles.statusIndicator, { backgroundColor: typeColor }]} />
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    fetchProducts(1, true);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedFilter, products]);

  const fetchProducts = async (targetPage = 1, replace = false) => {
    if (targetPage === 1) setLoading(true); else setLoadingMore(true);
    try {
      const response = await api.get(`https://inventory-management-system-uyit.onrender.com/api/products?page=${targetPage}&limit=10`);
      const list = response.data?.data || [];
      const pages = response.data?.totalPages || 1;
      setTotalPages(pages);
      setPage(targetPage);
      setProducts(replace ? list : [...products, ...list]);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(product => product.type === selectedFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.part_number?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchProducts(page + 1, false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Background */}
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header with Search */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <BlurView intensity={20} style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor="#FF6B00"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View
        style={[
          styles.filterSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip
            label="All"
            value="all"
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <FilterChip
            label="Accessories"
            value="accessories"
            selected={selectedFilter === 'accessories'}
            onPress={() => setSelectedFilter('accessories')}
          />
          <FilterChip
            label="Merchandise"
            value="merchandise"
            selected={selectedFilter === 'merchandise'}
            onPress={() => setSelectedFilter('merchandise')}
          />
          <FilterChip
            label="Workshop"
            value="workshop"
            selected={selectedFilter === 'workshop'}
            onPress={() => setSelectedFilter('workshop')}
          />
        </ScrollView>
      </Animated.View>

      {/* Products List */}
      <Animated.View
        style={[
          styles.productsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.productsList}
          contentContainerStyle={styles.productsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B00"
              colors={['#FF6B00']}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
            if (distanceFromBottom < 200) loadMore();
          }}
          scrollEventThrottle={250}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                onEdit={() => navigation.navigate('ProductEdit', { productId: product.id })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={80} color="#444" />
              </View>
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first product'
                }
              </Text>
              {!searchQuery && selectedFilter === 'all' && (
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => navigation.navigate('ProductCreate')}
                >
                  <LinearGradient
                    colors={['#FF6B00', '#FF8C00']}
                    style={styles.addFirstButtonGradient}
                  >
                    <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                    <Text style={styles.addFirstButtonText}>Add First Product</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loadingMore && (
            <View style={styles.loadingMore}>
              <View style={styles.loadingSpinner}>
                <Ionicons name="reload-outline" size={24} color="#FF6B00" />
              </View>
              <Text style={styles.loadingText}>Loading more products...</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ProductCreate')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B00', '#FF8C00']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    paddingRight: 20,
  },
  filterChip: {
    marginRight: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipSelected: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  filterChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -20,
    marginVertical: -10,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  filterChipTextSelected: {
    color: '#000',
  },
  productsContainer: {
    flex: 1,
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  productCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  productCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    position: 'relative',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productInfo: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 24,
  },
  productDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    lineHeight: 20,
  },
  partNumberContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  partNumberText: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  viewButton: {
    borderColor: 'rgba(255,107,0,0.3)',
    backgroundColor: 'rgba(255,107,0,0.1)',
  },
  editButton: {
    borderColor: 'rgba(74,222,128,0.3)',
    backgroundColor: 'rgba(74,222,128,0.1)',
  },
  productStats: {
    gap: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  lowStockText: {
    color: '#F59E0B',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
    opacity: 0.3,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addFirstButton: {
    marginTop: 10,
  },
  addFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});