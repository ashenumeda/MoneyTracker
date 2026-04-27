import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useApp } from '../context/AppContext';
import { getUnsyncedTransactions, markSynced } from '../db/database';

export default function ProfileScreen() {
  const { user } = useApp();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [syncing,  setSyncing]  = useState(false);

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const unsynced = await getUnsyncedTransactions();
      for (const tx of unsynced) {
        await setDoc(
          doc(collection(db, 'users', user.uid, 'transactions'), tx.id.toString()),
          {
            date:        tx.date,
            description: tx.description || '',
            amount:      tx.amount,
            account_id:  tx.account_id,
            side:        tx.side,
            group_id:    tx.group_id,
          }
        );
        await markSynced(tx.group_id);
      }
      Alert.alert('Sync complete', `${unsynced.length} rows pushed to cloud.`);
    } catch (e) {
      Alert.alert('Sync failed', e.message);
    }
    setSyncing(false);
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Logged in as</Text>
            <Text variant="bodyLarge" style={styles.email}>{user.email}</Text>
            <Divider style={styles.divider} />
            <Button
              mode="contained"
              onPress={handleSync}
              loading={syncing}
              style={styles.btn}
              icon="cloud-upload"
            >
              Sync to Cloud
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.btn}
              icon="logout"
            >
              Logout
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Login or Register</Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button mode="contained" onPress={handleLogin}    style={styles.btn}>Login</Button>
          <Button mode="outlined"  onPress={handleRegister} style={styles.btn}>Register</Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card:      { marginTop: 16 },
  title:     { marginBottom: 16 },
  input:     { marginBottom: 12 },
  email:     { color: '#1565C0', marginTop: 4, marginBottom: 4 },
  divider:   { marginVertical: 12 },
  btn:       { marginTop: 8 },
  error:     { color: 'red', marginBottom: 8 },
});