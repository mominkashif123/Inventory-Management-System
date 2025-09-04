import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  Divider,
  ActivityIndicator,
  DataTable,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function SaleDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { saleId } = route.params;
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSale();
  }, [saleId]);

  const fetchSale = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://inventory-management-system-uyit.onrender.com/api/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSale(data);
      } else {
        Alert.alert('Error', 'Failed to fetch sale details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={styles.errorContainer}>
        <Text>Sale not found</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Sale Details</Title>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sale ID:</Text>
            <Text style={styles.value}>#{sale.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(sale.saleDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{sale.customerName || 'Walk-in Customer'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Chip 
              mode="outlined" 
              style={[
                styles.chip,
                { backgroundColor: sale.status === 'completed' ? '#dcfce7' : '#fef2f2' }
              ]}
              textStyle={{ 
                color: sale.status === 'completed' ? '#166534' : '#dc2626' 
              }}
            >
              {sale.status?.charAt(0).toUpperCase() + sale.status?.slice(1) || 'Pending'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Items</Title>
          
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Product</DataTable.Title>
              <DataTable.Title numeric>Qty</DataTable.Title>
              <DataTable.Title numeric>Price</DataTable.Title>
              <DataTable.Title numeric>Total</DataTable.Title>
            </DataTable.Header>

            {sale.items?.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.productName}</DataTable.Cell>
                <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>${item.price}</DataTable.Cell>
                <DataTable.Cell numeric>${(item.quantity * item.price).toFixed(2)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>

          <Divider style={styles.divider} />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                ${sale.subtotal?.toFixed(2) || '0.00'}
              </Text>
            </View>
            
            {sale.tax && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={styles.summaryValue}>
                  ${sale.tax.toFixed(2)}
                </Text>
              </View>
            )}
            
            {sale.discount && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={styles.summaryValue}>
                  -${sale.discount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Total:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ${sale.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {sale.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{sale.notes}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f16',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  value: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  chip: {
    alignSelf: 'flex-end',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

