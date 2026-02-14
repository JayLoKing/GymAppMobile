import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { iniciarUso } from '../../services/api';

function parseMaquinaIdFromQr(data: string): number | null {
  const trimmed = data.trim();
  const asNum = parseInt(trimmed, 10);
  if (!Number.isNaN(asNum) && asNum > 0) return asNum;
  try {
    const parsed = JSON.parse(trimmed) as { maquina_id?: number; id?: number };
    if (typeof parsed.maquina_id === 'number') return parsed.maquina_id;
    if (typeof parsed.id === 'number') return parsed.id;
  } catch {
    // ignore
  }
  return null;
}

export default function ScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (processing) return;
    setScanned(true);

    const maquinaId = parseMaquinaIdFromQr(data);
    if (maquinaId == null) {
      Alert.alert(
        'QR no válido',
        'Este QR no corresponde a una máquina. Escanea el código de una máquina del gym.',
        [{ text: 'Entendido', onPress: () => setScanned(false) }]
      );
      return;
    }

    setProcessing(true);
    try {
      const uso = await iniciarUso(maquinaId);
      const nombre = uso.maquina?.nombre ?? `Máquina #${maquinaId}`;
      navigation.replace('ActiveUse', {
        usoActivoId: uso.id,
        maquinaNombre: nombre,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      Alert.alert(
        'No se pudo bloquear',
        message ?? 'La máquina puede estar en uso o hay un problema de conexión. Intenta de nuevo.',
        [{ text: 'Entendido', onPress: () => setScanned(false) }]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={styles.permText}>Necesitamos permiso para usar la cámara</Text>
        <Text style={styles.permSub}>Para escanear los QR de las máquinas</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Dar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Apunta al QR de la máquina</Text>
      </View>
      {scanned && (
        <View style={styles.footer}>
          {processing ? (
            <ActivityIndicator color={colors.primaryContrast} />
          ) : (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={20} color={colors.text} />
              <Text style={styles.rescanText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  permText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  permSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  permButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  permButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 24,
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  rescanText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
