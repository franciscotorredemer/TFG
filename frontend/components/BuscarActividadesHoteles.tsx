import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Platform
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import api from "../services/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  tipo: "actividad" | "hotel" | null;
  onSelect: (lugar: any, fechasHotel?: { inicio: string; fin: string }) => void;
  fechaLimiteInicio: string;
  fechaLimiteFin: string;
  fechaActividad?: string | null;
}

const BuscarActividadesHoteles: React.FC<Props> = ({ visible, onClose, tipo, onSelect, fechaLimiteInicio, fechaLimiteFin, fechaActividad }) => {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>(fechaLimiteInicio);
  const [fechaFin, setFechaFin] = useState<string>(fechaLimiteFin);
  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);

  const buscar = async () => {
    setLoading(true);
    try {
      const res = await api.get(`buscar_${tipo}s?q=${query}`);
      setResultados(res.data);
    } catch (err) {
      console.error("Error buscando:", err);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarLugar = (lugar: any) => {
    if (tipo === "hotel") {
      onSelect(lugar, { inicio: fechaInicio, fin: fechaFin });
    } else {
      onSelect(lugar);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Buscar {tipo === "hotel" ? "hotel" : "actividad"}</Text>

        <View style={estilos.buscarRow}>
          <TextInput
            placeholder="Buscar..."
            value={query}
            onChangeText={setQuery}
            style={estilos.input}
          />
          <TouchableOpacity onPress={buscar} style={estilos.botonBuscar}>
            <Text style={{ color: "white" }}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {tipo === "hotel" && (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity onPress={() => setMostrarFechaInicio(true)}>
              <Text>Fecha inicio: {fechaInicio}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMostrarFechaFin(true)}>
              <Text>Fecha fin: {fechaFin}</Text>
            </TouchableOpacity>

            {mostrarFechaInicio && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                value={new Date(fechaInicio)}
                minimumDate={new Date(fechaLimiteInicio)}
                maximumDate={new Date(fechaLimiteFin)}
                onChange={(e, date) => {
                  setMostrarFechaInicio(false);
                  if (date) setFechaInicio(date.toISOString().split("T")[0]);
                }}
              />
            )}

            {mostrarFechaFin && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                value={new Date(fechaFin)}
                minimumDate={new Date(fechaInicio)}
                maximumDate={new Date(fechaLimiteFin)}
                onChange={(e, date) => {
                  setMostrarFechaFin(false);
                  if (date) setFechaFin(date.toISOString().split("T")[0]);
                }}
              />
            )}
          </View>
        )}

        <FlatList
          data={resultados}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={estilos.card} onPress={() => seleccionarLugar(item)}>
              {item.foto && <Image source={{ uri: item.foto }} style={estilos.imagen} />}
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombre}>{item.nombre}</Text>
                <Text style={estilos.direccion}>{item.direccion}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={onClose} style={estilos.botonCerrar}>
          <Text style={{ color: "white" }}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  buscarRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 10,
  },
  botonBuscar: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  card: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginTop: 10,
  },
  imagen: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
  nombre: { fontWeight: "bold", fontSize: 16 },
  direccion: { color: "gray" },
  botonCerrar: {
    marginTop: 20,
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default BuscarActividadesHoteles;
