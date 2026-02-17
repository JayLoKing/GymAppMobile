import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { iniciarUso, getMaquinaById } from '../../services/api';

export default function ScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [maquinaInfo, setMaquinaInfo] = useState<{ id: number; nombre: string } | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScannedData(data);
    setModalVisible(true);
  };

  const handleUsar = async () => {
    setLoading(true);
    try {
      // Intentar parsear el dato escaneado como ID de máquina (número)
      const maquinaId = parseInt(scannedData, 10);
      
      if (isNaN(maquinaId)) {
        Alert.alert('Error', 'El código QR no contiene un ID de máquina válido');
        setModalVisible(false);
        setScanned(false);
        setLoading(false);
        return;
      }

      // Obtener info de la máquina
      const maquina = await getMaquinaById(maquinaId);
      
      // Iniciar uso de la máquina
      const uso = await iniciarUso(maquinaId);
      
      setModalVisible(false);
      
      // Navegar a ActiveUseScreen con la info del uso
      navigation.navigate('ActiveUse', {
        usoId: uso.id,
        maquinaNombre: maquina.nombre,
      });
    } catch (error: any) {
      console.error('Error al iniciar uso:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo iniciar el uso de la máquina. Intenta nuevamente.'
      );
      setModalVisible(false);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setScanned(false);
    setMaquinaInfo(null);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.permText}>Permiso de cámara necesario</Text>
        <Text style={styles.permSub}>Para escanear códigos QR de las máquinas</Text>
        <TouchableOpacity 
          style={styles.permButton} 
          onPress={requestPermission}
          activeOpacity={0.8}
        >
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
        barcodeScannerSettings={{ 
          barcodeTypes: ['qr', 'code128', 'code39', 'code93', 'codabar', 'ean13', 'ean8', 'itf14', 'upc_a', 'upc_e']
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Escanea el código QR de la máquina</Text>
      </View>

      {/* Modal con info de la máquina y botones */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="barbell" size={50} color={colors.primary} />
            
            <Text style={styles.modalTitle}>Máquina escaneada</Text>
            <Text style={styles.modalMessage}>
              ID: {scannedData}
            </Text>
            
            <Text style={styles.confirmText}>¿Deseas usar esta máquina?</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.useButton]}
                onPress={handleUsar}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryContrast} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primaryContrast} />
                    <Text style={styles.useButtonText}>Usar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: '600',
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
    paddingHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  hint: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  useButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
});