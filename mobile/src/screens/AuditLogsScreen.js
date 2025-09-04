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
  Searchbar,
} from 'react-native-paper';
import { authService } from '../services/authService';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch('https://inventory-management-system-uyit.onrender.com/api/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        Alert.alert('Error', 'Failed to fetch audit logs');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return '#dcfce7';
      case 'update':
        return '#dbeafe';
      case 'delete':
        return '#fef2f2';
      default:
        return '#f1f5f9';
    }
  };

  const getActionTextColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return '#166534';
      case 'update':
        return '#1e40af';
      case 'delete':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entityType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search logs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <ScrollView style={styles.content}>
        {filteredLogs.map(log => (
          <Card key={log.id} style={styles.logCard}>
            <Card.Content>
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <View style={styles.logMeta}>
                    <Chip 
                      mode="outlined" 
                      style={[
                        styles.actionChip,
                        { backgroundColor: getActionColor(log.action) }
                      ]}
                      textStyle={{ 
                        color: getActionTextColor(log.action) 
                      }}
                    >
                      {log.action?.charAt(0).toUpperCase() + log.action?.slice(1) || 'Unknown'}
                    </Chip>
                    <Chip mode="outlined" style={styles.entityChip}>
                      {log.entityType || 'Unknown'}
                    </Chip>
                  </View>
                  <Text style={styles.logDate}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.userName}>{log.userName || 'System'}</Text>
              </View>

              {log.details && (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.detailsLabel}>Details:</Text>
                  <Text style={styles.detailsText}>{log.details}</Text>
                </>
              )}

              {log.changes && (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.changesLabel}>Changes:</Text>
                  <Text style={styles.changesText}>{log.changes}</Text>
                </>
              )}
            </Card.Content>
          </Card>
        ))}

        {filteredLogs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No logs found matching your search' : 'No audit logs available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f16',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#121826',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logCard: {
    marginBottom: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logInfo: {
    flex: 1,
  },
  logMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  actionChip: {
    alignSelf: 'flex-start',
  },
  entityChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  logDate: {
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
  detailsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  changesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  changesText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
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

