import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseSync('moneytracker_v2.db');

export const initDB = async () => {
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS accounts (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT NOT NULL,
      description TEXT,
      amount      REAL NOT NULL,
      account_id  INTEGER NOT NULL,
      side        TEXT NOT NULL,
      group_id    TEXT NOT NULL,
      synced      INTEGER DEFAULT 0
    );`
  );
};

export const seedAccounts = async () => {
  const ObjectCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM accounts;');
  if (ObjectCount && ObjectCount.count === 0) {
    const defaults = [
      { name: 'BOC',           type: 'asset'   }, // Changed from Bank
      { name: "People's",      type: 'asset'   }, // New Bank
      { name: 'Food',          type: 'expense' },
      { name: 'Groceries',     type: 'expense' },
      { name: 'Transport',     type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Other',         type: 'expense' },
      { name: 'Salary',        type: 'income'  },
      { name: 'Freelance',     type: 'income'  },
    ];
    for (const acc of defaults) {
      await database.runAsync(
        'INSERT INTO accounts (name, type) VALUES (?, ?);',
        acc.name,
        acc.type
      );
    }
  }
};

export const getAccounts = async () => {
  return await database.getAllAsync('SELECT * FROM accounts ORDER BY type, name;');
};

export const addTransaction = async (debitAccountId, creditAccountId, amount, description, date) => {
  const groupId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO transactions (date, description, amount, account_id, side, group_id)
       VALUES (?, ?, ?, ?, 'debit', ?);`,
      date, description, amount, debitAccountId, groupId
    );
    await database.runAsync(
      `INSERT INTO transactions (date, description, amount, account_id, side, group_id)
       VALUES (?, ?, ?, ?, 'credit', ?);`,
      date, description, amount, creditAccountId, groupId
    );
  });
  return groupId;
};

export const getTransactions = async () => {
  return await database.getAllAsync(
    `SELECT t.*, a.name as account_name, a.type as account_type
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE t.side = 'debit'
     ORDER BY t.date DESC, t.id DESC;`
  );
};

export const deleteTransaction = async (groupId) => {
  await database.runAsync('DELETE FROM transactions WHERE group_id = ?;', groupId);
};

export const getBalances = async () => {
  const ObjectRows = await database.getAllAsync(
    `SELECT
       a.id, a.name, a.type,
       COALESCE(SUM(CASE WHEN t.side = 'debit'  THEN t.amount ELSE 0 END), 0) as total_debit,
       COALESCE(SUM(CASE WHEN t.side = 'credit' THEN t.amount ELSE 0 END), 0) as total_credit
     FROM accounts a
     LEFT JOIN transactions t ON a.id = t.account_id
     GROUP BY a.id
     ORDER BY a.type, a.name;`
  );
  
  return ObjectRows.map(row => ({
    ...row,
    balance: row.type === 'asset'
      ? row.total_debit - row.total_credit
      : row.total_credit - row.total_debit
  }));
};

export const markSynced = async (groupId) => {
  await database.runAsync('UPDATE transactions SET synced = 1 WHERE group_id = ?;', groupId);
};

export const getUnsyncedTransactions = async () => {
  return await database.getAllAsync(
    `SELECT t.*, a.name as account_name, a.type as account_type
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE t.synced = 0
     ORDER BY t.date ASC;`
  );
};