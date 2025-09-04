import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider, List } from 'react-native-paper';
import GlassCard from '../components/GlassCard';
import RingWidget from '../components/RingWidget';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/authService';

const { width } = Dimensions.get('window');

export default function ReportsScreen({ navigation }) {
  const [reports, setReports] = useState({
    salesSummary: {},
    inventoryValue: {},
    bestsellers: [],
    lowStock: [],
    recentSales: [],
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [
        salesSummaryRes,
        inventoryValueRes,
        bestsellersRes,
        lowStockRes,
        recentSalesRes,
      ] = await Promise.all([
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/sales-summary'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/inventory-value'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/bestsellers'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/low-stock'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/recent-sales'),
      ]);

      setReports({
        salesSummary: salesSummaryRes.data?.data || {},
        inventoryValue: { total_value: Number(inventoryValueRes.data?.data?.inventory_value) || 0 },
        bestsellers: bestsellersRes.data?.data || [],
        lowStock: lowStockRes.data?.data || [],
        recentSales: recentSalesRes.data?.data || [],
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statHeader}>
          <View style={styles.statIcon}>
            <Ionicons name={icon} size={32} color={color} />
          </View>
          <View style={styles.statText}>
            <Title style={styles.statValue}>{value}</Title>
            <Paragraph style={styles.statTitle}>{title}</Paragraph>
            {subtitle && <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>}
            {trend && (
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={trend > 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={trend > 0 ? '#10b981' : '#ef4444'} 
                />
                <Paragraph style={[
                  styles.trendText,
                  { color: trend > 0 ? '#10b981' : '#ef4444' }
                ]}>
                  {Math.abs(trend)}%
                </Paragraph>
              </View>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodContent}
      >
        {['week', 'month', 'quarter', 'year'].map((period) => (
          <Chip
            key={period}
            mode={selectedPeriod === period ? 'flat' : 'outlined'}
            selected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodChip,
              selectedPeriod === period && { backgroundColor: '#f97316' }
            ]}
            textStyle={[
              styles.periodChipText,
              selectedPeriod === period && { color: '#fff' }
            ]}
          >
            {getPeriodLabel(period)}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const SalesSummarySection = () => (
    <GlassCard style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Sales Summary</Title>
        <PeriodSelector />
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Sales"
            value={formatNumber(reports.salesSummary.total_sales || 0)}
            subtitle="Transactions"
            icon="cart"
            color="#f97316"
            trend={reports.salesSummary.sales_growth}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(reports.salesSummary.total_revenue || 0)}
            subtitle="Total earnings"
            icon="cash"
            color="#10b981"
            trend={reports.salesSummary.revenue_growth}
          />
          <View style={{ alignItems: 'center' }}>
            <RingWidget value={Number(reports.salesSummary.total_revenue || 0)} total={Math.max(1, Number(reports.salesSummary.total_revenue || 1))} subtitle={'Revenue'} />
          </View>
          <StatCard
            title="Customers"
            value={formatNumber(reports.salesSummary.unique_customers || 0)}
            subtitle="New customers"
            icon="people"
            color="#ec4899"
            trend={reports.salesSummary.customer_growth}
          />
        </View>
    </GlassCard>
  );

  const InventorySection = () => (
    <GlassCard style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Inventory Overview</Title>
        
        <View style={styles.inventoryStats}>
          <View style={styles.inventoryItem}>
            <Ionicons name="cube" size={24} color="#f97316" />
            <View style={styles.inventoryText}>
              <Title style={styles.inventoryValue}>
                {formatNumber(reports.inventoryValue.total_products || 0)}
              </Title>
              <Paragraph style={styles.inventoryLabel}>Total Products</Paragraph>
            </View>
          </View>
          
          <View style={styles.inventoryItem}>
            <Ionicons name="cash" size={24} color="#10b981" />
            <View style={styles.inventoryText}>
              <Title style={styles.inventoryValue}>
                {formatCurrency(reports.inventoryValue.total_value || 0)}
              </Title>
              <Paragraph style={styles.inventoryLabel}>Total Value</Paragraph>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.lowStockSection}>
          <Title style={styles.subsectionTitle}>Low Stock Alerts</Title>
          {reports.lowStock.length > 0 ? (
            reports.lowStock.slice(0, 3).map((item, index) => (
              <List.Item
                key={item.id || index}
                title={item.name}
                description={`Quantity: ${item.quantity} (Min: ${item.min_quantity})`}
                left={() => (
                  <View style={styles.lowStockIcon}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                  </View>
                )}
                right={() => (
                  <Chip mode="outlined" style={styles.stockChip}>
                    {item.quantity}
                  </Chip>
                )}
                style={styles.lowStockItem}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Paragraph style={styles.emptyStateText}>All products are well stocked</Paragraph>
            </View>
          )}
        </View>
    </GlassCard>
  );

  const TopProductsSection = () => (
    <GlassCard style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Top Products</Title>
        
        {reports.bestsellers.length > 0 ? (
          reports.bestsellers.slice(0, 5).map((product, index) => (
            <View key={product.id || index} style={styles.topProductItem}>
              <View style={styles.rankContainer}>
                <Chip
                  mode="flat"
                  style={[
                    styles.rankChip,
                    { backgroundColor: index < 3 ? '#f59e0b' : '#94a3b8' }
                  ]}
                  textStyle={styles.rankChipText}
                >
                  #{index + 1}
                </Chip>
              </View>
              
              <View style={styles.productInfo}>
                <Title style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Title>
                <Paragraph style={styles.productStats}>
                  {formatNumber(product.total_sold || 0)} units sold • {formatCurrency(product.total_revenue || 0)}
                </Paragraph>
              </View>
              
              <View style={styles.productActions}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                  style={styles.viewProductButton}
                  compact
                >
                  View
                </Button>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trending-up" size={32} color="#94a3b8" />
            <Paragraph style={styles.emptyStateText}>No sales data available</Paragraph>
          </View>
        )}
    </GlassCard>
  );

  const RecentActivitySection = () => (
    <GlassCard style={styles.sectionCard}>
        <Title style={styles.sectionTitle}>Recent Activity</Title>
        
        {reports.recentSales.length > 0 ? (
          reports.recentSales.slice(0, 5).map((sale, index) => (
            <List.Item
              key={sale.id || index}
              title={`Sale #${sale.id}`}
              description={`${formatCurrency(sale.total_amount || 0)} • ${new Date(sale.created_at).toLocaleDateString()}`}
              left={() => (
                <View style={styles.activityIcon}>
                  <Ionicons name="receipt" size={20} color="#f97316" />
                </View>
              )}
              right={() => (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('SaleDetails', { saleId: sale.id })}
                  style={styles.viewSaleButton}
                  compact
                >
                  View
                </Button>
              )}
              style={styles.activityItem}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time" size={32} color="#94a3b8" />
            <Paragraph style={styles.emptyStateText}>No recent activity</Paragraph>
          </View>
        )}
    </GlassCard>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <SalesSummarySection />
      <InventorySection />
      <TopProductsSection />
      <RecentActivitySection />
      
      {/* Export Options */}
    <GlassCard style={styles.exportCard}>
          <Title style={styles.sectionTitle}>Export Reports</Title>
          <View style={styles.exportButtons}>
            <Button
              mode="outlined"
              icon="file-pdf-box"
              onPress={() => Alert.alert('Info', 'PDF export functionality coming soon')}
              style={styles.exportButton}
            >
              Export PDF
            </Button>
            <Button
              mode="outlined"
              icon="file-excel"
              onPress={() => Alert.alert('Info', 'Excel export functionality coming soon')}
              style={styles.exportButton}
            >
              Export Excel
            </Button>
          </View>
    </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f16',
  },
  sectionCard: {
    margin: 20,
    marginBottom: 15,
    elevation: 2,
    backgroundColor: '#121826',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 20,
  },
  periodSelector: {
    marginBottom: 20,
  },
  periodContent: {
    paddingRight: 20,
  },
  periodChip: {
    marginRight: 10,
    borderRadius: 20,
  },
  periodChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    gap: 15,
  },
  statCard: {
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 1,
  },
  statCardContent: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 15,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inventoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  inventoryItem: {
    alignItems: 'center',
  },
  inventoryText: {
    alignItems: 'center',
    marginTop: 8,
  },
  inventoryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  inventoryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#1f2937',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  lowStockSection: {
    gap: 10,
  },
  lowStockItem: {
    paddingVertical: 8,
  },
  lowStockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockChip: {
    backgroundColor: '#f0f9ff',
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rankContainer: {
    marginRight: 15,
  },
  rankChip: {
    minWidth: 40,
  },
  rankChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 14,
    color: '#9ca3af',
  },
  productActions: {
    alignItems: 'flex-end',
  },
  viewProductButton: {
    borderColor: '#f97316',
  },
  activityItem: {
    paddingVertical: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewSaleButton: {
    marginTop: -10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    color: '#94a3b8',
    marginTop: 10,
    textAlign: 'center',
  },
  exportCard: {
    margin: 20,
    marginBottom: 30,
    elevation: 2,
    backgroundColor: '#121826',
    borderRadius: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    flex: 1,
    marginHorizontal: 10,
    borderColor: '#f97316',
  },
});
