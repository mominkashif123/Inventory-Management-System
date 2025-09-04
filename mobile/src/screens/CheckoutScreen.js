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
  Text,
  Chip,
  Divider,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch('https://inventory-management-system-uyit.onrender.com/api/products?page=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.data || [];
        setProducts(data.filter(p => Number(p.quantity) > 0));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        maxQuantity: product.quantity,
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const item = cart.find(item => item.productId === productId);
    if (item && newQuantity <= item.maxQuantity) {
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Please add items to cart');
      return;
    }

    setLoading(true);
    try {
      const token = await authService.getToken();
      const saleData = {
        user_id: 0,
        customer_name: formData.customerName || null,
        customer_email: null,
        customer_number: null,
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await fetch('https://inventory-management-system-uyit.onrender.com/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Success', 
          'Sale completed successfully!',
          [
            { 
              text: 'View Details', 
              onPress: () => navigation.navigate('SaleDetails', { saleId: (result.data?.id || result.id) })
            },
            { text: 'OK', onPress: () => navigation.navigate('Sales') }
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to complete sale');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.productsSection}>
        <Title style={styles.sectionTitle}>Available Products</Title>
        {products.map(product => (
          <Card key={product.id} style={styles.productCard}>
            <Card.Content>
              <View style={styles.productInfo}>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <Text style={styles.productStock}>In Stock: {product.quantity}</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={() => addToCart(product)}
                  disabled={cart.find(item => item.productId === product.id)?.quantity >= product.quantity}
                  style={styles.addButton}
                >
                  Add
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Card style={styles.cartSection}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Cart</Title>
          
          {cart.length === 0 ? (
            <Text style={styles.emptyCart}>No items in cart</Text>
          ) : (
            <>
              {cart.map(item => (
                <View key={item.productId} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.productName}</Text>
                    <Text style={styles.cartItemPrice}>${item.price}</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <Button
                      mode="outlined"
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      -
                    </Button>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <Button
                      mode="outlined"
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      style={styles.quantityButton}
                    >
                      +
                    </Button>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              <Divider style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
              </View>

              <TextInput
                label="Customer Name (Optional)"
                value={formData.customerName}
                onChangeText={(text) => setFormData({...formData, customerName: text})}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Notes (Optional)"
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />

              <Button
                mode="contained"
                onPress={handleCheckout}
                loading={loading}
                disabled={loading || cart.length === 0}
                style={styles.checkoutButton}
              >
                Complete Sale
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f16',
  },
  productsSection: {
    flex: 1,
    padding: 16,
  },
  cartSection: {
    padding: 16,
    backgroundColor: '#121826',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  productCard: {
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 14,
    color: '#64748b',
  },
  addButton: {
    backgroundColor: '#f97316',
  },
  emptyCart: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 60,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f97316',
  },
  input: {
    marginBottom: 12,
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    marginTop: 8,
    paddingVertical: 8,
  },
});

