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
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function ProductDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const data = await response.json();
        setProduct(data);
      } else {
        Alert.alert('Error', 'Failed to fetch product details');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProduct },
      ]
    );
  };

  const deleteProduct = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://inventory-management-system-uyit.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Product deleted successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to delete product');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{product.name}</Title>
          
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.value}>${product.price}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{product.quantity}</Text>
          </View>

          {product.category && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Category:</Text>
              <Chip mode="outlined" style={styles.chip}>
                {product.category}
              </Chip>
            </View>
          )}

          {product.sku && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>SKU:</Text>
              <Text style={styles.value}>{product.sku}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Chip 
              mode="outlined" 
              style={[
                styles.chip,
                { backgroundColor: product.quantity > 0 ? '#dcfce7' : '#fef2f2' }
              ]}
              textStyle={{ 
                color: product.quantity > 0 ? '#166534' : '#dc2626' 
              }}
            >
              {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ProductEdit', { productId })}
              style={[styles.button, styles.editButton]}
            >
              Edit Product
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
              textColor="#dc2626"
            >
              Delete Product
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#f97316',
  },
  deleteButton: {
    borderColor: '#dc2626',
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

