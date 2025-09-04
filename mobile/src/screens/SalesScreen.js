// SalesScreen.jsx
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

// Sales Summary Widget
const SalesSummaryWidget = ({ filteredSales }) => {
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <BlurView intensity={20} style={styles.summaryCard}>
      <LinearGradient
        colors={['rgba(255,107,0,0.15)', 'rgba(0,0,0,0.8)']}
        style={styles.summaryCardGradient}
      >
        <Text style={styles.summaryTitle}>Sales Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#4ADE8020' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#4ADE80" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{totalSales}</Text>
              <Text style={styles.summaryLabel}>Total Sales</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#60A5FA20' }]}>
              <Ionicons name="cash-outline" size={20} color="#60A5FA" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>${totalRevenue.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Revenue</Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#A78BFA20' }]}>
              <Ionicons name="analytics-outline" size={20} color="#A78BFA" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>${averageOrderValue.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Avg. Order</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </BlurView>
  );
};

// Sale Card Component
const SaleCard = ({ sale, onPress }) => {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4ADE80';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#4ADE80';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = getStatusColor(sale.status);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <BlurView intensity={20} style={styles.saleCard}>
          <LinearGradient
            colors={[`${statusColor}15`, 'rgba(0,0,0,0.8)']}
            style={styles.saleCardGradient}
          >
            {/* Sale Header */}
            <View style={styles.saleHeader}>
              <View style={styles.saleInfo}>
                <View style={styles.saleIdContainer}>
                  <View style={[styles.saleIcon, { backgroundColor: `${statusColor}20` }]}>
                    <Ionicons name="receipt-outline" size={16} color={statusColor} />
                  </View>
                  <View style={styles.saleDetails}>
                    <Text style={styles.saleId}>Sale #{sale.id}</Text>
                    <Text style={styles.saleDate}>{formatDate(sale.created_at)}</Text>
                  </View>
                </View>
                {sale.customer_name && (
                  <View style={styles.customerContainer}>
                    <Ionicons name="person-outline" size={14} color="#888" />
                    <Text style={styles.customerName}>{sale.customer_name}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.saleAmount}>
                <Text style={styles.saleAmountValue}>
                  {formatCurrency(sale.total)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {sale.status || 'Completed'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Sale Stats */}
            <View style={styles.saleStats}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(96,165,250,0.2)' }]}>
                  <Ionicons name="basket-outline" size={14} color="#60A5FA" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{sale.items?.length || 0}</Text>
                  <Text style={styles.statLabel}>Items</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(168,139,250,0.2)' }]}>
                  <Ionicons name="person-outline" size={14} color="#A78BFA" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {sale.salesperson_name || 'System'}
                  </Text>
                  <Text style={styles.statLabel}>Salesperson</Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {sale.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText} numberOfLines={2}>
                  "{sale.notes}"
                </Text>
              </View>
            )}

            {/* Status Indicator */}
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SalesScreen({ navigation }) {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
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

    fetchSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [searchQuery, selectedFilter, sales]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get('https://inventory-management-system-uyit.onrender.com/api/sales');
      setSales(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      Alert.alert('Error', 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = sales;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.id.toString().includes(query) ||
        sale.customer_name?.toLowerCase().includes(query) ||
        sale.customer_email?.toLowerCase().includes(query)
      );
    }

    if (selectedFilter === 'today') {
      const today = new Date();
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate.toDateString() === today.toDateString();
      });
    } else if (selectedFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= weekAgo;
      });
    } else if (selectedFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= monthAgo;
      });
    }

    setFilteredSales(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSales();
    setRefreshing(false);
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
              placeholder="Search sales..."
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
            label="Today"
            value="today"
            selected={selectedFilter === 'today'}
            onPress={() => setSelectedFilter('today')}
          />
          <FilterChip
            label="This Week"
            value="week"
            selected={selectedFilter === 'week'}
            onPress={() => setSelectedFilter('week')}
          />
          <FilterChip
            label="This Month"
            value="month"
            selected={selectedFilter === 'month'}
            onPress={() => setSelectedFilter('month')}
          />
        </ScrollView>
      </Animated.View>

      {/* Sales Summary */}
      <Animated.View
        style={[
          styles.summarySection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <SalesSummaryWidget filteredSales={filteredSales} />
      </Animated.View>

      {/* Sales List */}
      <Animated.View
        style={[
          styles.salesContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          style={styles.salesList}
          contentContainerStyle={styles.salesContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B00"
              colors={['#FF6B00']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onPress={() => navigation.navigate('SaleDetails', { saleId: sale.id })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={80} color="#444" />
              </View>
              <Text style={styles.emptyStateTitle}>No sales found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by creating your first sale'
                }
              </Text>
              {!searchQuery && selectedFilter === 'all' && (
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => navigation.navigate('Checkout')}
                >
                  <LinearGradient
                    colors={['#FF6B00', '#FF8C00']}
                    style={styles.addFirstButtonGradient}
                  >
                    <Ionicons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
                    <Text style={styles.addFirstButtonText}>Create First Sale</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
          onPress={() => navigation.navigate('Checkout')}
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
    paddingBottom: 15,
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
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  salesContainer: {
    flex: 1,
  },
  salesList: {
    flex: 1,
  },
  salesContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  saleCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  saleCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    position: 'relative',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  saleInfo: {
    flex: 1,
    marginRight: 15,
  },
  saleIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  saleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleDetails: {
    flex: 1,
  },
  saleId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  saleDate: {
    fontSize: 12,
    color: '#888',
  },
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: '#888',
    marginLeft: 6,
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  saleAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4ADE80',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  saleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  notesContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
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