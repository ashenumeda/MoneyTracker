# MoneyTracker

A double-entry personal finance app built with React Native (Expo).
Works offline with local SQLite storage. Optional cloud backup via Firebase.

---

## About

MoneyTracker uses double-entry accounting. Every transaction has two sides:

- Debit — money going into an account (e.g. Food expense increases)
- Credit — money leaving an account (e.g. Bank balance decreases)

This keeps your numbers balanced at all times.

---

## Features

- Double-entry ledger with Asset, Expense, and Income accounts
- Works 100% offline — all data stored on your phone
- Cloud backup via Firebase email login
- Spending reports — daily, weekly, monthly
- Transfer tracking between accounts
- CSV export

---

## Tech Stack

- React Native (Expo managed workflow)
- SQLite via expo-sqlite
- React Navigation (Bottom Tabs + Stack)
- React Native Paper (Material Design UI)
- react-native-chart-kit
- Firebase Authentication
- Cloud Firestore
- EAS Build

---

## Project Structure

```
MoneyTracker/
├── assets/
├── src/
│   ├── db/
│   │   └── database.js
│   ├── firebase/
│   │   └── config.js
│   ├── screens/
│   │   ├── DashboardScreen.js
│   │   ├── AddTransactionScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── ReportsScreen.js
│   │   └── ProfileScreen.js
│   ├── components/
│   └── context/
│       └── AppContext.js
├── App.js
├── app.json
├── .gitignore
└── package.json
```

---

## Database Schema

Two tables only.

accounts
- id (INTEGER, primary key)
- name (TEXT) — e.g. Bank, Food, Salary
- type (TEXT) — asset | expense | income

transactions
- id (INTEGER, primary key)
- date (TEXT) — e.g. 2025-04-26
- description (TEXT)
- amount (REAL)
- account_id (INTEGER, foreign key to accounts)
- side (TEXT) — debit | credit
- group_id (TEXT) — UUID shared by both legs of one event
- synced (INTEGER) — 0 or 1

Every financial event creates exactly 2 rows with the same group_id.

Example: Rs. 450 spent on food from bank
- Row 1: account=Food,  side=debit,  amount=450, group_id=abc-123
- Row 2: account=Bank,  side=credit, amount=450, group_id=abc-123

---

## Architecture Diagram

<!-- INSERT IMAGE: images/architecture.png -->
<!-- PlantUML code is in the Diagrams section below -->

---

## Data Flow Diagram

<!-- INSERT IMAGE: images/dataflow.png -->
<!-- PlantUML code is in the Diagrams section below -->

---

## ER Diagram

<!-- INSERT IMAGE: images/erd.png -->
<!-- PlantUML code is in the Diagrams section below -->

---

## Screens

Dashboard
- Shows net worth and account balances
- FAB button to add a transaction

Add Transaction
- Choose Expense, Income, or Transfer
- Pick accounts, enter amount and description

History
- All transactions listed by date
- Search bar and delete support

Reports
- Bar charts for daily, weekly, monthly spending

Profile
- Email login, Firebase sync, CSV export, logout

---

## UI Screenshots

<!-- Replace with actual screenshots after building the app -->

- Dashboard:  images/ui/dashboard.png
- Add:        images/ui/add.png
- History:    images/ui/history.png
- Reports:    images/ui/reports.png
- Profile:    images/ui/profile.png

---

## Getting Started

See SETUP_GUIDE.md for the full step-by-step guide.

Quick summary:
1. Install Node.js and Expo CLI
2. Run: npm install
3. Add your Firebase config to src/firebase/config.js
4. Run: npx expo start
5. Scan the QR code with Expo Go on your phone

---

## Git and GitHub

This project uses Git for version control.
The .gitignore file excludes node_modules, .env, and firebase config.

To push to GitHub:
1. Create a new repository on github.com
2. Run the commands in SETUP_GUIDE.md under the Git section

---

## Roadmap

- [x] Double-entry SQLite engine
- [x] Basic screens and navigation
- [x] Firebase auth and sync
- [ ] Recurring transactions
- [ ] Budget limits per category
- [ ] Dark mode

---

## License

MIT

---

## PlantUML Diagrams

Paste each block at planttext.com, click Submit, download the PNG, save to the images/ folder.

---

### 1. Architecture Diagram
Save as: images/architecture.png

```
@startuml

skinparam componentStyle rectangle
skinparam backgroundColor white

actor User

rectangle "Mobile App (React Native + Expo)" {
  component "UI Screens" as UI
  component "Business Logic" as Logic
  database "SQLite Local" as SQLite
  component "Firebase SDK" as SDK
}

cloud "Firebase Cloud" {
  component "Authentication" as Auth
  component "Firestore DB" as Firestore
}

User --> UI : uses
UI --> Logic : calls functions
Logic --> SQLite : read and write
Logic --> SDK : sync if logged in
SDK --> Auth : login and logout
SDK --> Firestore : backup and restore

@enduml
```

---

### 2. Data Flow Diagram
Save as: images/dataflow.png

```
@startuml
title Saving a Transaction

actor User
participant "Add Transaction Screen" as UI
participant "database.js" as Logic
participant "SQLite on device" as DB
participant "Firestore cloud" as Cloud

User -> UI : fills form and taps Save
UI -> Logic : addTransaction(debitAcc, creditAcc, amount, desc)
Logic -> DB : INSERT debit row (group_id = uuid)
Logic -> DB : INSERT credit row (same group_id)
DB --> Logic : success
Logic --> UI : return group_id

alt user is logged in
  Logic -> Cloud : push both rows to Firestore
  Cloud --> Logic : confirmed
end

UI --> User : show success message

@enduml
```

---

### 3. ER Diagram
Save as: images/erd.png

```
@startuml

entity "accounts" as A {
  *id : INTEGER (PK)
  --
  name : TEXT
  type : TEXT
}

entity "transactions" as T {
  *id : INTEGER (PK)
  --
  date : TEXT
  description : TEXT
  amount : REAL
  account_id : INTEGER (FK)
  side : TEXT
  group_id : TEXT
  synced : INTEGER
}

A ||--o{ T : "one account has many rows"

@enduml
```