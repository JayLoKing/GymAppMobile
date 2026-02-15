import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

export default function ScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [scannedType, setScannedType] = useState('');

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScannedType(type);
    setScannedData(data);
    setModalVisible(true);
  };

  const handleNavigate = async () => {
    setModalVisible(false);
    
    try {
      // Detectar si es una URL
      const isUrl = scannedData.match(/^(https?:\/\/|www\.)[^\s]+$/i);
      
      if (isUrl) {
        // Abrir enlace en el navegador
        let url = scannedData;
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        
        const supported = await Linking.canOpenURL(url);
        
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir este enlace');
        }
      } 
      // Detectar si es un número de teléfono
      else if (scannedData.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) {
        const tel = `tel:${scannedData.replace(/[^0-9+]/g, '')}`;
        const supported = await Linking.canOpenURL(tel);
        
        if (supported) {
          await Linking.openURL(tel);
        } else {
          Alert.alert('Error', 'No se puede llamar a este número');
        }
      }
      // Detectar si es un email
      else if (scannedData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        const email = `mailto:${scannedData}`;
        const supported = await Linking.canOpenURL(email);
        
        if (supported) {
          await Linking.openURL(email);
        } else {
          Alert.alert('Error', 'No se puede enviar email');
        }
      }
      // Detectar coordenadas GPS
      else if (scannedData.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)) {
        const [lat, lon] = scannedData.split(',').map(coord => coord.trim());
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        await Linking.openURL(mapsUrl);
      }
      // Detectar si es un texto plano (buscar en Google)
      else {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(scannedData)}`;
        await Linking.openURL(searchUrl);
      }
      
      // Resetear después de navegar
      setTimeout(() => {
        setScanned(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir el contenido escaneado',
        [
          { 
            text: 'OK', 
            onPress: () => setScanned(false) 
          }
        ]
      );
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setScanned(false); // Permitir escanear otro código
  };

  // Detectar tipo de contenido para mostrar icono apropiado
  const getContentIcon = () => {
    if (scannedData.match(/^(https?:\/\/|www\.)/i)) {
      if (scannedData.includes('youtube.com') || scannedData.includes('youtu.be')) {
        return <Ionicons name="logo-youtube" size={50} color="#FF0000" />;
      }
      return <Ionicons name="globe-outline" size={50} color={colors.primary} />;
    } else if (scannedData.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) {
      return <Ionicons name="call-outline" size={50} color="#4CAF50" />;
    } else if (scannedData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return <Ionicons name="mail-outline" size={50} color="#2196F3" />;
    } else if (scannedData.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)) {
      return <Ionicons name="location-outline" size={50} color="#F44336" />;
    } else {
      return <Ionicons name="text-outline" size={50} color={colors.primary} />;
    }
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
        <Text style={styles.permSub}>Para escanear códigos QR</Text>
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
          barcodeTypes: ['qr', 'aztec', 'pdf417', 'code128', 'code39', 'code93', 'codabar', 'ean13', 'ean8', 'itf14', 'upc_a', 'upc_e']
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Escanea cualquier código</Text>
      </View>

      {/* Modal con dos botones */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {getContentIcon()}
            
            <Text style={styles.modalTitle}>Contenido escaneado</Text>
            <Text style={styles.modalMessage} numberOfLines={3}>
              {scannedData}
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.navigateButton]}
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <Text style={styles.navigateButtonText}>Abrir</Text>
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
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: '100%',
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
  navigateButton: {
    backgroundColor: colors.primary,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});