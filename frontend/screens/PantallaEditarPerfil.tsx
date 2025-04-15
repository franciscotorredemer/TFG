"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  StatusBar,
  Keyboard,
  Animated,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "../services/api"
import { type NavigationProp, useIsFocused } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"

interface Props {
  navigation: NavigationProp<any>
}

interface UserProfile {
  username: string
  email: string
  foto_perfil?: string
  bio?: string
  ubicacion?: string
}

const PantallaEditarPerfil: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    foto_perfil: "",
    bio: "",
    ubicacion: "",
  })
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [imageLoading, setImageLoading] = useState(false)

  const isFocused = useIsFocused()
  const bioInputRef = useRef<TextInput>(null)
  const locationInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const confirmPasswordInputRef = useRef<TextInput>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    if (isFocused) {
      cargarPerfil()

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isFocused])

  const cargarPerfil = async () => {
    setIsLoading(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const response = await api.get("perfil/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile({
        username: response.data.username || "",
        email: response.data.email || "",
        foto_perfil: response.data.foto_perfil || "",
        bio: response.data.bio || "",
        ubicacion: response.data.ubicacion || "",
      })
    } catch (error) {
      console.error("Error al cargar perfil:", error)
      Alert.alert("Error", "No se pudo cargar tu perfil. Intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permiso denegado", "Necesitamos permiso para acceder a tu galería")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageLoading(true)

        // Here you would normally upload the image to your server
        // For this example, we'll just update the local state
        setTimeout(() => {
          setProfile((prev) => ({
            ...prev,
            foto_perfil: result.assets[0].uri,
          }))
          setHasChanges(true)
          setImageLoading(false)
        }, 1000)
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen")
      setImageLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!profile.username.trim()) {
      newErrors.username = "El nombre de usuario es obligatorio"
    } else if (profile.username.length < 3) {
      newErrors.username = "El nombre debe tener al menos 3 caracteres"
    }

    if (password && password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGuardar = async () => {
    Keyboard.dismiss()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const token = await AsyncStorage.getItem("access_token")
      const data: any = {
        username: profile.username,
        bio: profile.bio,
        ubicacion: profile.ubicacion,
      }

      if (password) {
        data.password = password
      }

      // If you had image upload functionality, you would handle that here
      // For this example, we're assuming the API accepts these fields

      await api.put("perfil/", data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Alert.alert("Éxito", "Perfil actualizado correctamente")
      setHasChanges(false)
      navigation.goBack()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo más tarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert("Cambios sin guardar", "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => navigation.goBack() },
      ])
    } else {
      navigation.goBack()
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            {imageLoading ? (
              <View style={styles.imageLoading}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <Image
                source={profile.foto_perfil ? { uri: profile.foto_perfil } : require("../assets/imagenes/user.png")}
                style={styles.profileImage}
              />
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage} disabled={imageLoading}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.changePhotoText}>Toca para cambiar tu foto</Text>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <View style={[styles.inputContainer, errors.username ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={profile.username}
                onChangeText={(text) => handleInputChange("username", text)}
                placeholder="Tu nombre de usuario"
                returnKeyType="next"
                onSubmitEditing={() => bioInputRef.current?.focus()}
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Biografía</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={bioInputRef}
                style={styles.input}
                value={profile.bio}
                onChangeText={(text) => handleInputChange("bio", text)}
                placeholder="Cuéntanos sobre ti"
                multiline
                numberOfLines={3}
                returnKeyType="next"
                onSubmitEditing={() => locationInputRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={locationInputRef}
                style={styles.input}
                value={profile.ubicacion}
                onChangeText={(text) => handleInputChange("ubicacion", text)}
                placeholder="Tu ciudad o país"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: "#999" }]}
                value={profile.email}
                editable={false}
                placeholder="Tu email"
              />
            </View>
            <Text style={styles.helperText}>El email no se puede cambiar</Text>
          </View>

          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  setHasChanges(true)
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }))
                  }
                }}
                placeholder="Deja en blanco si no quieres cambiarla"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : (
              <Text style={styles.helperText}>Mínimo 6 caracteres</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordInputRef}
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  setHasChanges(true)
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }))
                  }
                }}
                placeholder="Repite la nueva contraseña"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleGuardar}
              />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]}
            onPress={handleGuardar}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: 20,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  changePhotoText: {
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 20,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "rgba(255, 59, 48, 0.05)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  passwordToggle: {
    padding: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#99c9ff",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default PantallaEditarPerfil
