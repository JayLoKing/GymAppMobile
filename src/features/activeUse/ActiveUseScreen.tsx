import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { finalizarUso } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveUse'>;

export default function ActiveUseScreen({ navigation, route }: Props) {
  const { usoId, maquinaNombre } = route.params;
  const [loading, setLoading] = useState(false);

  const handleLiberar = () => {
    Alert.alert(
      'Liberar máquina',
      `¿Finalizar uso de "${maquinaNombre}"? La máquina quedará disponible para otros.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Liberar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await finalizarUso(usoId);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'No se pudo liberar la máquina. Revisa la conexión.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="barbell-outline" size={64} color={colors.text} />
      </View>
      <Text style={styles.maquinaName}>{maquinaNombre}</Text>
      <Text style={styles.status}>En uso</Text>
      <Text style={styles.hint}>Cuando termines, libera la máquina para que otros puedan usarla.</Text>

      <TouchableOpacity
        style={styles.liberarButton}
        onPress={handleLiberar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryContrast} />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.primaryContrast} />
            <Text style={styles.liberarButtonText}>Liberar máquina</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  maquinaName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  status: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  liberarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  liberarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
});
