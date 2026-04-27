import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import DashboardScreen      from './src/screens/DashboardScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import HistoryScreen        from './src/screens/HistoryScreen';
import ReportsScreen        from './src/screens/ReportScreen';
import ProfileScreen        from './src/screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'MoneyTracker' }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Add Transaction' }}
      />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Home:    'view-dashboard',
  History: 'history',
  Reports: 'chart-bar',
  Profile: 'account',
};

function MainApp() {
  const { dbReady } = useApp();
  if (!dbReady) return null;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1565C0',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name={TAB_ICONS[route.name]}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="Home"    component={HomeStack}     options={{ title: 'Home'    }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <PaperProvider>
          <AppProvider>
            <MainApp />
          </AppProvider>
        </PaperProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}