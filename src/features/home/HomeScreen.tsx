import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const formatTiempo = (fecha?: string | Date) => {
    if (!fecha) return 'Recientemente';
    try {
      const date = new Date(fecha);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recientemente';
    }
  };

  const renderItem = ({ item }: { item: UsoActivo }) => {
    const nombre = item.maquina?.nombre ?? `Máquina #${item.maquina_id}`;
    
    // Intentar con diferentes posibles nombres de propiedad para la fecha
    const tiempoInicio = formatTiempo(
      // @ts-ignore - Intentamos diferentes propiedades posibles
      item.inicio || item.fecha_inicio || item.created_at || item.fecha
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ActiveUse', {
            usoId: item.id,
            maquinaNombre: nombre,
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="fitness" size={24} color={colors.primary} />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{nombre}</Text>
          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{tiempoInicio}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="alert-circle-outline" size={14} color="#FFA000" />
              <Text style={styles.detailText}>En uso</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardAction}>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          <Text style={styles.cardActionText}>Ver</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.title}>Gimnasio</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="barbell-outline" size={20} color={colors.primary} />
          <Text style={styles.headerBadgeText}>
            {usosActivos.length} {usosActivos.length === 1 ? 'activo' : 'activos'}
          </Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus máquinas activas</Text>
            {usosActivos.length > 0 && (
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Cargando tus máquinas...</Text>
            </View>
          ) : (
            <FlatList
              data={usosActivos}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <LinearGradient
                    colors={['rgba(98, 0, 238, 0.1)', 'transparent']}
                    style={styles.emptyGradient}
                  >
                    <Ionicons name="scan-outline" size={80} color={colors.primary} />
                  </LinearGradient>
                  <Text style={styles.emptyTitle}>Sin máquinas activas</Text>
                  <Text style={styles.emptyMessage}>
                    Escanea el código QR de cualquier máquina para comenzar tu entrenamiento
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanGradient}
          >
            <Ionicons name="qr-code" size={28} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>ESCANEAR QR</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.footerHint}>
          Apunta el código QR de la máquina al escáner
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardAction: {
    alignItems: 'center',
    marginLeft: 8,
  },
  cardActionText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  footerHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});