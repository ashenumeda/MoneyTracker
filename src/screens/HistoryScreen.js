import React, { useState, useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Searchbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction } from '../db/database';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    const data = await getTransactions();
    setTransactions(data);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const filtered = transactions.filter(t => {
    const query = search.toLowerCase();
    return (
      t.account_name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  const handleDelete = async (groupId) => {
    await deleteTransaction(groupId);
    loadData();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
        <View style={styles.info}>
          <Text variant="bodyLarge">{item.account_name}</Text>
          <Text variant="bodySmall" style={styles.date}>{item.date}</Text>
          {item.description ? (
            <Text variant="bodySmall" style={styles.desc}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.right}>
          <Text variant="titleMedium" style={styles.amount}>
            Rs. {item.amount.toFixed(2)}
          </Text>
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={() => handleDelete(item.group_id)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by account or description"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  search:    { margin: 16 },
  list:      { paddingHorizontal: 16, paddingBottom: 24 },
  card:      { marginBottom: 8 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info:      { flex: 1 },
  right:     { alignItems: 'flex-end' },
  date:      { color: '#888', marginTop: 2 },
  desc:      { color: '#666', marginTop: 2 },
  amount:    { color: '#1565C0', fontWeight: 'bold' },
  empty:     { textAlign: 'center', color: '#999', marginTop: 48 },
});