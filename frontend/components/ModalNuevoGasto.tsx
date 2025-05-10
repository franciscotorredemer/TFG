import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const categorias = [
  "Comida",
  "Transporte",
  "Alojamiento",
  "Ocio",
  "Compras",
  "Otros"
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onGuardar: (gasto: any) => void;
}

const ModalNuevoGasto: React.FC<Props> = ({ visible, onClose, onGuardar }) => {
  const [concepto, setConcepto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [fecha, setFecha] = useState(new Date());
  const [notas, setNotas] = useState("");
  const [mostrarFecha, setMostrarFecha] = useState(false);

  const guardar = () => {
    if (!concepto || !cantidad) {
      alert("Concepto y cantidad son obligatorios.");
      return;
    }

    onGuardar({
      concepto,
      cantidad: parseFloat(cantidad),
      categoria,
      fecha: fecha.toISOString().split("T")[0],
      notas
    });

    // Reset y cerrar
    setConcepto("");
    setCantidad("");
    setCategoria("Comida");
    setNotas("");
    setFecha(new Date());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.titulo}>Nuevo gasto</Text>

          <TextInput
            placeholder="Concepto"
            style={styles.input}
            value={concepto}
            onChangeText={setConcepto}
          />

          <TextInput
            placeholder="Cantidad en €"
            style={styles.input}
            keyboardType="numeric"
            value={cantidad}
            onChangeText={setCantidad}
          />

          <Text style={styles.label}>Categoría:</Text>
          <View style={styles.categorias}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoria(cat)}
                style={[
                  styles.categoria,
                  categoria === cat && styles.categoriaActiva
                ]}
              >
                <Text
                  style={{ color: categoria === cat ? "white" : "#333" }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setMostrarFecha(true)}
            style={styles.fechaBtn}
          >
            <Text>Fecha: {fecha.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {mostrarFecha && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, d) => {
                setMostrarFecha(false);
                if (d) setFecha(d);
              }}
            />
          )}

          <TextInput
            placeholder="Notas (opcional)"
            style={[styles.input, { height: 60 }]}
            value={notas}
            onChangeText={setNotas}
            multiline
          />

          <View style={styles.botones}>
            <TouchableOpacity style={styles.cancelar} onPress={onClose}>
              <Text style={{ color: "#333" }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guardar} onPress={guardar}>
              <Text style={{ color: "white" }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%"
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 8,
    marginVertical: 8
  },
  label: {
    marginTop: 10,
    fontWeight: "bold"
  },
  categorias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6
  },
  categoria: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 2
  },
  categoriaActiva: {
    backgroundColor: "#007AFF"
  },
  fechaBtn: {
    marginTop: 12,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8
  },
  botones: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  cancelar: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center"
  },
  guardar: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    flex: 1,
    alignItems: "center"
  }
});

export default ModalNuevoGasto;
