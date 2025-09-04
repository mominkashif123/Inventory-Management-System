import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function ProductEditScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    sku: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://inventory-management-system-uyit.onrender.com/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          quantity: product.quantity?.toString() || '',
          category: product.category || '',
          sku: product.sku || '',
        });
      } else {
        Alert.alert('Error', 'Failed to fetch product details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://inventory-management-system-uyit.onrender.com/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Product updated successfully!');
        navigation.goBack();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update product');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Edit Product</Title>
          
          <TextInput
            label="Product Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Price *"
            value={formData.price}
            onChangeText={(text) => setFormData({...formData, price: text})}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.price}
          />
          <HelperText type="error" visible={!!errors.price}>
            {errors.price}
          </HelperText>

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
            label="Category"
            value={formData.category}
            onChangeText={(text) => setFormData({...formData, category: text})}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="SKU"
            value={formData.sku}
            onChangeText={(text) => setFormData({...formData, sku: text})}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, styles.cancelButton]}
              disabled={saving}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving}
              style={[styles.button, styles.saveButton]}
            >
              Save Changes
            </Button>
          </View>
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
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e293b',
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#64748b',
  },
  saveButton: {
    backgroundColor: '#f97316',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

