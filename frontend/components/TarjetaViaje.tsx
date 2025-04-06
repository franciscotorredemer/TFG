import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface TarjetaViajeProps {
  nombre: string;
  ciudad: string;
  fecha_inicio: string;
  fecha_fin: string;
  imagen_destacada: string;
  actividades?: number;
  onPress: () => void;
  onDelete?: () => void; // ← Añadido
}

const TarjetaViaje: React.FC<TarjetaViajeProps> = ({
  nombre,
  ciudad,
  fecha_inicio,
  fecha_fin,
  imagen_destacada,
  actividades,
  onPress,
  onDelete,
}) => {
  const confirmarEliminacion = () => {
    Alert.alert(
      "¿Seguro quieres eliminar este viaje?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.bloqueViaje} activeOpacity={0.8} onPress={onPress}>
      <Image source={{ uri: imagen_destacada }} style={styles.imagenViaje} />
      <View style={styles.infoViaje}>
        <View style={styles.encabezado}>
          <Text style={styles.nombreViaje}>{nombre}</Text>
          {onDelete && (
            <TouchableOpacity onPress={confirmarEliminacion}>
              <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.textoFechas}>
          {new Date(fecha_inicio).toLocaleDateString()} - {new Date(fecha_fin).toLocaleDateString()}
        </Text>
        {typeof actividades === "number" && (
          <Text style={styles.textoActividades}>{actividades} actividades</Text>
        )}
        <Text style={styles.textoCiudad}>{ciudad}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bloqueViaje: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  imagenViaje: {
    width: 120,
    height: 80,
    borderRadius: 10,
  },
  infoViaje: {
    flex: 1,
    paddingLeft: 15,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nombreViaje: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textoFechas: {
    fontSize: 14,
    color: "gray",
    marginTop: 3,
  },
  textoActividades: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
  textoCiudad: {
    fontSize: 14,
    color: "#347CAF",
    marginTop: 2,
  },
});

export default TarjetaViaje;
