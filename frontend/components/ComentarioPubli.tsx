import React from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  comentario: string;
  onChangeComentario: (text: string) => void;
  onPublicar: () => void;
}

const ComentarioPubli: React.FC<Props> = ({
  visible,
  onClose,
  comentario,
  onChangeComentario,
  onPublicar,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={estilos.fondo}>
        <View style={estilos.contenido}>
          <Text style={estilos.titulo}>Añade un comentario</Text>
          <TextInput
            style={estilos.input}
            placeholder="Escribe aquí..."
            value={comentario}
            onChangeText={onChangeComentario}
            multiline
          />
          <View style={estilos.filaBotones}>
            <TouchableOpacity onPress={onClose} style={[estilos.boton, estilos.cancelar]}>
              <Text style={estilos.textoBoton}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPublicar} style={[estilos.boton, estilos.publicar]}>
              <Text style={estilos.textoBoton}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  contenido: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  filaBotones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  boton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelar: {
    backgroundColor: "#ccc",
  },
  publicar: {
    backgroundColor: "#007AFF",
  },
  textoBoton: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ComentarioPubli;
