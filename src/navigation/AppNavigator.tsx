import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../features/home/HomeScreen';
import ScannerScreen from '../features/scanner/ScannerScreen';
import ActiveUseScreen from '../features/activeUse/ActiveUseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTintColor: '#000000',
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#FFFFFF' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ title: 'Escanear QR' }}
        />
        <Stack.Screen
          name="ActiveUse"
          component={ActiveUseScreen}
          options={{ title: 'En uso' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}