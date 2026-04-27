import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getBalances } from '../db/database';

export default function DashboardScreen({ navigation }) {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getBalances();
    setBalances(data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const assets = balances.filter(b => b.type === 'asset');
  const netWorth = assets.reduce((sum, a) => sum + a.balance, 0);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Card style={styles.netWorthCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.label}>Net Worth</Text>
            <Text variant="displaySmall" style={styles.netWorthAmount}>
              Rs. {netWorth.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>Accounts</Text>

        {assets.map(acc => (
          <Card key={acc.id} style={styles.accCard}>
            <Card.Content style={styles.accRow}>
              <Text variant="bodyLarge">{acc.name}</Text>
              <Text variant="bodyLarge" style={styles.balance}>
                Rs. {acc.balance.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        ))}

      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  scroll:         { padding: 16, paddingBottom: 100 },
  netWorthCard:   { marginBottom: 24, backgroundColor: '#1565C0' },
  label:          { color: '#90CAF9' },
  netWorthAmount: { color: '#fff', marginTop: 4 },
  sectionTitle:   { marginBottom: 8, color: '#555' },
  accCard:        { marginBottom: 8 },
  accRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balance:        { fontWeight: 'bold', color: '#1565C0' },
  fab:            { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#1565C0' },
});