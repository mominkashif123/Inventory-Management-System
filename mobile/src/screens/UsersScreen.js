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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';

export default function UsersScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch('https://inventory-management-system-uyit.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        Alert.alert('Error', 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteUser(userId) },
      ]
    );
  };

  const deleteUser = async (userId) => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://inventory-management-system-uyit.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'User deleted successfully!');
        fetchUsers();
      } else {
        Alert.alert('Error', 'Failed to delete user');
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {users.map(user => (
          <Card key={user.id} style={styles.userCard}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Title style={styles.userName}>{user.name}</Title>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <Chip 
                      mode="outlined" 
                      style={[
                        styles.roleChip,
                        { backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe' }
                      ]}
                      textStyle={{ 
                        color: user.role === 'admin' ? '#92400e' : '#1e40af' 
                      }}
                    >
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                    </Chip>
                    <Text style={styles.userDate}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {/* TODO: Edit user */}}
                    style={styles.actionButton}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDeleteUser(user.id, user.name)}
                    style={[styles.actionButton, styles.deleteButton]}
                    textColor="#dc2626"
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* TODO: Add new user */}}
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
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  userDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  deleteButton: {
    borderColor: '#dc2626',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f97316',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

