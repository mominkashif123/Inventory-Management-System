// DashboardScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Animated,
  Text,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/authService';
import {
  GradientStatCard,
  RingWidget,
  ActionButton,
  GlassCard,
} from '../components';
import { colors, spacing, typography, shadows, borderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Enhanced Quick Action Button
const QuickActionButton = ({ title, icon, onPress, color = colors.primary }) => {
  return (
    <ActionButton
      title={title}
      icon={icon}
      onPress={onPress}
      variant="ghost"
      size="small"
      style={styles.quickActionButton}
    />
  );
};

// Enhanced Stats Section
const StatsSection = ({ stats, onStatPress, loading }) => {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Business Overview</Text>
      <View style={styles.statsGrid}>
        {stats && stats.length > 0 ? (
          stats.map((stat, index) => (
            <GradientStatCard
              key={stat.title || index}
              title={stat.title || 'Stat'}
              value={stat.value || '0'}
              icon={stat.icon || 'help-circle'}
              color={stat.color || colors.primary}
              subtitle={stat.subtitle || ''}
              trend={stat.trend || 0}
              onPress={() => onStatPress && onStatPress(stat)}
              size="medium"
              style={styles.statCard}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No stats available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Enhanced Progress Section
const ProgressSection = ({ progressData, loading }) => {
  return (
    <View style={styles.progressSection}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      <View style={styles.progressGrid}>
        {progressData && progressData.length > 0 ? (
          progressData.map((item, index) => (
            <RingWidget
              key={item.title || index}
              value={item.value || 0}
              total={item.total || 100}
              title={item.title || 'Metric'}
              subtitle={item.subtitle || ''}
              color={item.color || colors.primary}
              size={120}
              style={styles.progressWidget}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No metrics available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Enhanced Quick Actions Section
const QuickActionsSection = ({ actions, onActionPress }) => {
  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {actions && actions.length > 0 ? (
          actions.map((action, index) => (
            <View key={action.title || index} style={styles.quickActionContainer}>
              <QuickActionButton
                title={action.title || 'Action'}
                icon={action.icon || 'help-circle'}
                onPress={() => onActionPress && onActionPress(action)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No actions available</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Enhanced Recent Activity Section
const RecentActivitySection = ({ activities, loading }) => {
  return (
    <View style={styles.recentActivitySection}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <GlassCard style={styles.activityCard}>
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color || colors.primary }]}>
                <Ionicons name={String(activity.icon || 'help-circle')} size={16} color="#000" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{String(activity.title || 'Activity')}</Text>
                <Text style={styles.activityTime}>{String(activity.time || 'Recently')}</Text>
              </View>
              <View style={styles.activityValue}>
                <Text style={styles.activityValueText}>{String(activity.value || 'N/A')}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    progress: [],
    activities: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const quickActions = [
    {
      title: 'Add Product',
      icon: 'add-circle',
    },
    {
      title: 'New Sale',
      icon: 'cart',
    },
    {
      title: 'Reports',
      icon: 'analytics',
    },
    {
      title: 'Settings',
      icon: 'settings',
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from your backend endpoints
      const [productsRes, salesRes, lowStockRes, recentSalesRes] = await Promise.all([
        api.get('https://inventory-management-system-uyit.onrender.com/api/products?page=1&limit=1'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/sales'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/low-stock'),
        api.get('https://inventory-management-system-uyit.onrender.com/api/reports/recent-sales'),
      ]);

      // Process the real data
      const products = productsRes.data;
      const sales = salesRes.data;
      const lowStock = lowStockRes.data;
      const recentSales = recentSalesRes.data;

      // Safely handle data structures
      const salesArray = Array.isArray(sales) ? sales : (sales?.sales || []);
      const lowStockArray = Array.isArray(lowStock) ? lowStock : (lowStock?.items || []);
      const recentSalesArray = Array.isArray(recentSales) ? recentSales : (recentSales?.sales || []);

      // Calculate stats from real data
      const totalProducts = products.total || 0;
      const totalSales = salesArray.length || 0;
      const totalRevenue = salesArray.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
      const lowStockCount = lowStockArray.length || 0;

      // Create stats from real data
      const stats = [
        {
          title: 'Total Products',
          value: String(totalProducts || 0),
          icon: 'cube',
          color: colors.primary,
          subtitle: 'In inventory',
          trend: 0, // You can calculate trend if you have historical data
        },
        {
          title: 'Total Sales',
          value: String(totalSales || 0),
          icon: 'cart',
          color: colors.success,
          subtitle: 'All time',
          trend: 0,
        },
        {
          title: 'Revenue',
          value: `$${(totalRevenue || 0).toFixed(2)}`,
          icon: 'cash',
          color: colors.warning,
          subtitle: 'Total earnings',
          trend: 0,
        },
        {
          title: 'Low Stock',
          value: String(lowStockCount || 0),
          icon: 'warning',
          color: colors.error,
          subtitle: 'Items to restock',
          trend: 0,
        },
      ];

      // Create progress data from real data
      const progress = [
        {
          title: 'Inventory Level',
          value: Number(Math.min(100, Math.max(0, totalProducts > 0 ? ((totalProducts - lowStockCount) / totalProducts) * 100 : 0))),
          total: 100,
          subtitle: 'Stock health',
          color: colors.primary,
        },
        {
          title: 'Sales Performance',
          value: Number(Math.min(100, Math.max(0, (totalSales / 100) * 100))), // Assuming 100 is target
          total: 100,
          subtitle: 'Monthly target',
          color: colors.success,
        },
        {
          title: 'Stock Efficiency',
          value: Number(Math.min(100, Math.max(0, totalProducts > 0 ? ((totalProducts - lowStockCount) / totalProducts) * 100 : 0))),
          total: 100,
          subtitle: 'Optimal levels',
          color: colors.warning,
        },
      ];

      // Create activities from real data using recent sales
      const activities = [
        ...(recentSalesArray.slice(0, 3).map(sale => ({
          title: String('Sale completed'),
          time: String(sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'Today'),
          value: String(`+$${parseFloat(sale.total || 0).toFixed(2)}`),
          icon: 'cart',
          color: colors.success,
        }))),
        ...(lowStockArray.slice(0, 2).map(item => ({
          title: String('Low stock alert'),
          time: String('Today'),
          value: String(`${item.stock || 0} units`),
          icon: 'warning',
          color: colors.error,
        }))),
      ];

      setDashboardData({
        stats,
        progress,
        activities,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep empty arrays if API fails
      setDashboardData({
        stats: [],
        progress: [],
        activities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleStatPress = (stat) => {
    // Navigate to relevant screen based on stat
    console.log('Stat pressed:', stat.title);
  };

  const handleActionPress = (action) => {
    switch (action.title) {
      case 'Add Product':
        navigation.navigate('ProductCreate');
        break;
      case 'New Sale':
        navigation.navigate('Checkout');
        break;
      case 'Reports':
        navigation.navigate('Reports');
        break;
      case 'Settings':
        // Navigate to settings
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="person-circle" size={40} color={colors.textInverse} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <StatsSection
          stats={dashboardData.stats}
          onStatPress={handleStatPress}
          loading={loading}
        />

        {/* Progress Section */}
        <ProgressSection
          progressData={dashboardData.progress}
          loading={loading}
        />

        {/* Quick Actions */}
        <QuickActionsSection
          actions={quickActions}
          onActionPress={handleActionPress}
        />

        {/* Recent Activity */}
        <RecentActivitySection
          activities={dashboardData.activities}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    minHeight: height,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    ...shadows.large,
    minHeight: 120,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.body.fontSize,
    color: colors.textInverse,
    opacity: 0.9,
  },
  userName: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  headerIcon: {
    ...shadows.medium,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    minHeight: height - 120, // Account for header
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.lg * 3) / 2,
    minHeight: 120,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 140,
  },
  progressWidget: {
    marginHorizontal: spacing.xs,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionContainer: {
    width: (width - spacing.lg * 3) / 2,
  },
  quickActionButton: {
    height: 80,
  },
  recentActivitySection: {
    marginBottom: spacing.xl,
  },
  activityCard: {
    padding: spacing.md,
    minHeight: 200,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.small.fontSize,
    color: colors.textSecondary,
  },
  activityValue: {
    alignItems: 'flex-end',
  },
  activityValueText: {
    fontSize: typography.captionBold.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});