import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Menu } from 'react-native-paper';
import { getAccounts, addTransaction } from '../db/database';

const TYPE_CONFIG = {
  expense:  { debitType: 'expense', creditType: 'asset'  },
  income:   { debitType: 'asset',   creditType: 'income' },
  transfer: { debitType: 'asset',   creditType: 'asset'  },
};

const LABELS = {
  expense:  { debit: 'Category (what you spent on)', credit: 'Paid from (account)' },
  income:   { debit: 'Into account',                 credit: 'Income source'       },
  transfer: { debit: 'To account',                   credit: 'From account'        },
};

export default function AddTransactionScreen({ navigation }) {
  const [type,        setType]        = useState('expense');
  const [amount,      setAmount]      = useState('');
  const [description, setDescription] = useState('');
  const [accounts,    setAccounts]    = useState([]);
  const [debitAcc,    setDebitAcc]    = useState(null);
  const [creditAcc,   setCreditAcc]   = useState(null);
  const [debitMenu,   setDebitMenu]   = useState(false);
  const [creditMenu,  setCreditMenu]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  const filteredDebit  = accounts.filter(a => a.type === TYPE_CONFIG[type].debitType);
  const filteredCredit = accounts.filter(a => a.type === TYPE_CONFIG[type].creditType);

  const handleSave = async () => {
    if (!amount || !debitAcc || !creditAcc) {
      alert('Please fill all fields');
      return;
    }
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    await addTransaction(debitAcc.id, creditAcc.id, parseFloat(amount), description, today);
    setSaving(false);
    navigation.goBack();
  };

  const handleTypeChange = (val) => {
    setType(val);
    setDebitAcc(null);
    setCreditAcc(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SegmentedButtons
        value={type}
        onValueChange={handleTypeChange}
        buttons={[
          { value: 'expense',  label: 'Expense'  },
          { value: 'income',   label: 'Income'   },
          { value: 'transfer', label: 'Transfer' },
        ]}
        style={styles.segment}
      />

      <TextInput
        label="Amount (Rs.)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.label}>{LABELS[type].debit}</Text>
      <Menu
        visible={debitMenu}
        onDismiss={() => setDebitMenu(false)}
        anchor={
          <Button mode="outlined" onPress={() => setDebitMenu(true)} style={styles.picker}>
            {debitAcc ? debitAcc.name : 'Select...'}
          </Button>
        }
      >
        {filteredDebit.map(acc => (
          <Menu.Item
            key={acc.id}
            title={acc.name}
            onPress={() => { setDebitAcc(acc); setDebitMenu(false); }}
          />
        ))}
      </Menu>

      <Text style={styles.label}>{LABELS[type].credit}</Text>
      <Menu
        visible={creditMenu}
        onDismiss={() => setCreditMenu(false)}
        anchor={
          <Button mode="outlined" onPress={() => setCreditMenu(true)} style={styles.picker}>
            {creditAcc ? creditAcc.name : 'Select...'}
          </Button>
        }
      >
        {filteredCredit.map(acc => (
          <Menu.Item
            key={acc.id}
            title={acc.name}
            onPress={() => { setCreditAcc(acc); setCreditMenu(false); }}
          />
        ))}
      </Menu>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        style={styles.saveBtn}
        contentStyle={{ paddingVertical: 8 }}
      >
        Save Transaction
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f5f5f5', flexGrow: 1 },
  segment:   { marginBottom: 16 },
  input:     { marginBottom: 12 },
  label:     { marginBottom: 4, color: '#555', marginTop: 8 },
  picker:    { marginBottom: 12 },
  saveBtn:   { marginTop: 24, backgroundColor: '#1565C0' },
});