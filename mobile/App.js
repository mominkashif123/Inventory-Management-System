import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/utils/theme';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import ProductCreateScreen from './src/screens/ProductCreateScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import ProductEditScreen from './src/screens/ProductEditScreen';
import SalesScreen from './src/screens/SalesScreen';
import SaleDetailsScreen from './src/screens/SaleDetailsScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import UsersScreen from './src/screens/UsersScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import InventoryAdjustmentsScreen from './src/screens/InventoryAdjustmentsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Harley Davidson inspired theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.textSecondary,
    border: colors.surfaceLight,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
};

// Main tab navigator for authenticated users with swipe support
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Sales') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          elevation: 8,
          shadowColor: colors.shadows.dark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Enable swipe gestures
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Full screen mode for better experience
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen 
        name="Sales" 
        component={SalesScreen}
        options={{ title: 'Sales' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
}

// Stack navigator for the "More" tab
function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.surface,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="MoreMain" 
        component={MoreMainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Users" 
        component={UsersScreen}
        options={{ title: 'Users' }}
      />
      <Stack.Screen 
        name="AuditLogs" 
        component={AuditLogsScreen}
        options={{ title: 'Audit Logs' }}
      />
      <Stack.Screen 
        name="InventoryAdjustments" 
        component={InventoryAdjustmentsScreen}
        options={{ title: 'Inventory Adjustments' }}
      />
    </Stack.Navigator>
  );
}

// Simple screen for the More tab
function MoreMainScreen({ navigation }) {
  return (
    <DashboardScreen navigation={navigation} />
  );
}

// Main app component
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // You can add a splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="ProductCreate" 
              component={ProductCreateScreen}
              options={{
                headerShown: true,
                title: 'New Product',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.surface,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="ProductDetails" 
              component={ProductDetailsScreen}
              options={{
                headerShown: true,
                title: 'Product Details',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.surface,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="ProductEdit" 
              component={ProductEditScreen}
              options={{
                headerShown: true,
                title: 'Edit Product',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.surface,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="SaleDetails" 
              component={SaleDetailsScreen}
              options={{
                headerShown: true,
                title: 'Sale Details',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.surface,
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Checkout" 
              component={CheckoutScreen}
              options={{
                headerShown: true,
                title: 'Checkout',
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: theme.colors.surface,
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppContent />
        <StatusBar style="light" />
      </AuthProvider>
    </PaperProvider>
  );
}
