import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { getMisUsosActivos } from '../../services/api';
import type { UsoActivo } from '../../types/models';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [usosActivos, setUsosActivos] = useState<UsoActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsos = useCallback(async () => {
    try {
      const data = await getMisUsosActivos();
      setUsosActivos(Array.isArray(data) ? data : []);
    } catch {
      setUsosActivos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsos();
    }, [loadUsos])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUsos();
  };

  const renderItem = ({ item }: { item: UsoActivo }) => {
    const nombre = item.maquina?.nombre ?? `Máquina #${item.maquina_id}`;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ActiveUse', {
            usoActivoId: item.id,
            maquinaNombre: nombre,
          })
        }
        activeOpacity={0.7}
      >
        <Ionicons name="barbell-outline" size={24} color={colors.text} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{nombre}</Text>
          <Text style={styles.cardSub}>En uso · Toca para liberar</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gym</Text>
        <Text style={styles.subtitle}>Escanea un QR para bloquear una máquina temporalmente.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis máquinas en uso</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} style={styles.loader} />
        ) : (
          <FlatList
            data={usosActivos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="barbell-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyText}>Ninguna máquina en uso</Text>
                <Text style={styles.emptySub}>Escanea un QR para empezar</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scanner')}
        activeOpacity={0.8}
      >
        <Ionicons name="qr-code-outline" size={28} color={colors.primaryContrast} />
        <Text style={styles.scanButtonText}>Escanear QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  section: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardText: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
});
