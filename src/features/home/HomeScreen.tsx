import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gym Fit Pro</Text>
            <Text style={styles.subtitle}>Escanea una máquina para ver su guía</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Scanner')}
            >
                <Text style={styles.buttonText}>Escanear QR</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
    button: { backgroundColor: '#007AFF', padding: 20, borderRadius: 10 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});