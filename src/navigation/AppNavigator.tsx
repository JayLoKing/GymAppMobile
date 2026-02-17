import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './types';
import { colors } from '../theme/colors';

import LoginScreen from '../features/login/LoginScreen';
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
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Verificar si hay token guardado
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setUserToken(token);
      } catch (e) {
        console.warn('Failed to restore token', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={userToken ? 'Home' : 'Login'}
        screenOptions={screenOptions}
      >
        {!userToken ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}