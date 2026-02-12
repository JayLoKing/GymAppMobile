import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../features/home/HomeScreen';
import ScannerScreen from '../features/scanner/ScannerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">

                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Bienvenido' }}
                />

                <Stack.Screen
                    name="Scanner"
                    component={ScannerScreen}
                    options={{ title: 'Escanear Máquina' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}