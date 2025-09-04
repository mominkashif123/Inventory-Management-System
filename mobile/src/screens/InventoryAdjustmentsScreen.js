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
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  FAB,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function InventoryAdjustmentsScreen() {
  const navigation = useNavigation();
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    adjustmentType: 'add',
    quantity: '',
    reason: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await authService.getToken();
      
      // Fetch products
      const productsResponse = await fetch('https://inventory-management-system-uyit.onrender.com/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      // Fetch adjustments
      const adjustmentsResponse = await fetch('https://inventory-management-system-uyit.onrender.com/api/inventory-adjustments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (productsResponse.ok && adjustmentsResponse.ok) {
        const productsData = await productsResponse.json();
        const adjustmentsData = await adjustmentsResponse.json();
        setProducts(productsData);
        setAdjustments(adjustmentsData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = await authService.getToken();
      const response = await fetch('https://inventory-management-system-uyit.onrender.com/api/inventory-adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Adjustment created successfully!');
        setShowForm(false);
        setFormData({ productId: '', adjustmentType: 'add', quantity: '', reason: '' });
        fetchData();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to create adjustment');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const getAdjustmentTypeColor = (type) => {
    return type === 'add' ? '#dcfce7' : '#fef2f2';
  };

  const getAdjustmentTypeTextColor = (type) => {
    return type === 'add' ? '#166534' : '#dc2626';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {adjustments.map(adjustment => {
          const product = products.find(p => p.id === adjustment.productId);
          return (
            <Card key={adjustment.id} style={styles.adjustmentCard}>
              <Card.Content>
                <View style={styles.adjustmentHeader}>
                  <View style={styles.adjustmentInfo}>
                    <Text style={styles.productName}>{product?.name || 'Unknown Product'}</Text>
                    <View style={styles.adjustmentMeta}>
                      <Chip 
                        mode="outlined" 
                        style={[
                          styles.typeChip,
                          { backgroundColor: getAdjustmentTypeColor(adjustment.adjustmentType) }
                        ]}
                        textStyle={{ 
                          color: getAdjustmentTypeTextColor(adjustment.adjustmentType) 
                        }}
                      >
                        {adjustment.adjustmentType === 'add' ? '+' : '-'}{adjustment.quantity}
                      </Chip>
                      <Text style={styles.adjustmentDate}>
                        {new Date(adjustment.adjustedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userName}>{adjustment.userName || 'System'}</Text>
                </View>

                <Divider style={styles.divider} />
                
                <Text style={styles.reasonLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{adjustment.reason}</Text>

                {adjustment.notes && (
                  <>
                    <Divider style={styles.divider} />
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{adjustment.notes}</Text>
                  </>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {adjustments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No inventory adjustments available</Text>
          </View>
        )}
      </ScrollView>

      {showForm && (
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>New Adjustment</Title>
            
            <TextInput
              label="Product *"
              value={formData.productId}
              onChangeText={(text) => setFormData({...formData, productId: text})}
              mode="outlined"
              style={styles.input}
              error={!!errors.productId}
            />
            <HelperText type="error" visible={!!errors.productId}>
              {errors.productId}
            </HelperText>

            <View style={styles.typeContainer}>
              <Button
                mode={formData.adjustmentType === 'add' ? 'contained' : 'outlined'}
                onPress={() => setFormData({...formData, adjustmentType: 'add'})}
                style={[styles.typeButton, styles.addButton]}
              >
                Add Stock
              </Button>
              <Button
                mode={formData.adjustmentType === 'remove' ? 'contained' : 'outlined'}
                onPress={() => setFormData({...formData, adjustmentType: 'remove'})}
                style={[styles.typeButton, styles.removeButton]}
              >
                Remove Stock
              </Button>
            </View>

            <TextInput
              label="Quantity *"
              value={formData.quantity}
              onChangeText={(text) => setFormData({...formData, quantity: text})}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.quantity}
            />
            <HelperText type="error" visible={!!errors.quantity}>
              {errors.quantity}
            </HelperText>

            <TextInput
              label="Reason *"
              value={formData.reason}
              onChangeText={(text) => setFormData({...formData, reason: text})}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              error={!!errors.reason}
            />
            <HelperText type="error" visible={!!errors.reason}>
              {errors.reason}
            </HelperText>

            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                Create Adjustment
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <FAB
        icon={showForm ? 'close' : 'plus'}
        style={styles.fab}
        onPress={() => setShowForm(!showForm)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f16',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  adjustmentCard: {
    marginBottom: 16,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  adjustmentInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  adjustmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  adjustmentDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f97316',
  },
  divider: {
    marginVertical: 12,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
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
  formCard: {
    margin: 16,
    backgroundColor: '#121826',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e293b',
  },
  input: {
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#10b981',
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#64748b',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#f97316',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f97316',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

