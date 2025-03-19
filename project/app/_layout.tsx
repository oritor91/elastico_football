import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useFrameworkReady();
  
  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          drawerStyle: {
            backgroundColor: '#2C1F4A',
            width: '80%',
            maxWidth: 300,
          },
          drawerLabelStyle: {
            color: '#FFFFFF',
            fontSize: 16,
          },
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 8,
            marginVertical: 4,
          },
          drawerActiveBackgroundColor: 'rgba(255, 215, 0, 0.2)',
          drawerActiveTintColor: '#FFD700',
          drawerInactiveTintColor: '#FFFFFF',
        }}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="matchday"
          options={{
            drawerLabel: 'Match Day',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="football" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="teams/create"
          options={{
            drawerLabel: 'Create Teams',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="games"
          options={{
            drawerLabel: 'Games',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="(tabs)/players"
          options={{
            drawerLabel: 'Players',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
      <StatusBar style="light" />
    </>
  );
}