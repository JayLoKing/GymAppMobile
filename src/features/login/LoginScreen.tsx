import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from '../../services/api';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Props>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      console.log('Login exitoso:', result);
      // La navegación se manejará en AppNavigator con el contexto de autenticación
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Error en login:', error);
      
      let errorMessage = 'Ocurrió un error. Intenta de nuevo.';
      
      // Error de conexión de red
      if (error.message?.includes('Error de conexión')) {
        errorMessage = error.message;
      }
      // Error de respuesta del servidor
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Error de credenciales
      else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Email o contraseña incorrectos.';
      }
      // Error de red genérico
      else if (error.message === 'Network Error') {
        errorMessage = 
          'No se puede conectar al servidor.\n\n' +
          'Verifica:\n' +
          '✓ Tu PC está prendida\n' +
          '✓ Backend corre en :3000\n' +
          '✓ Mismo WiFi\n' +
          '✓ URL correcta en src/config/api.ts';
      }
      
      Alert.alert('Error de acceso', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // TODO: Implementar pantalla de registro o navegar a registro
    Alert.alert('Registro', 'La funcionalidad de registro se implementará pronto');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header con logo */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <Ionicons name="barbell" size={48} color={colors.background} />
          </LinearGradient>
          <Text style={styles.appTitle}>GymApp</Text>
          <Text style={styles.appSubtitle}>Tu control de máquinas de gimnasio</Text>
        </View>

        {/* Formulario de login */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Contraseña"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Botón de Login */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryContrast} size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={colors.primaryContrast} />
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={styles.registerButtonText}>Crear una cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Para más información:</Text>
          <Text style={styles.footerSubtext}>Contacta al administrador del gimnasio</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryContrast,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.textMuted,
    fontSize: 14,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
