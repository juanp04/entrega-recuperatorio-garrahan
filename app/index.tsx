import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Character = {
  id: number;
  name: string;
  image: string;
  species: string;
  status: string;
  type: string;
  gender: string;
};

export default function Index() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async (reset = false) => {
    if (loading || !hasNextPage) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      let url = `https://rickandmortyapi.com/api/character/?page=${currentPage}`;
      if (name) url += `&name=${encodeURIComponent(name)}`;
      if (status) url += `&status=${status}`;
      if (gender) url += `&gender=${gender}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        if (reset) setCharacters([]);
        setHasNextPage(false);
      } else {
        setCharacters(reset ? data.results : [...characters, ...data.results]);
        setHasNextPage(data.info.next !== null);
        setPage(currentPage + 1);
      }
    } catch (e) {
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasNextPage(true);
    fetchCharacters(true);
  }, [name, status, gender]);

  const openModal = (char: Character) => {
    setSelectedCharacter(char);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personajes</Text>
      <TextInput style={styles.input} placeholder="Buscar por nombre..." value={name} onChangeText={setName} />
      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Estado</Text>
          <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
            <Picker.Item label="Todos" value="" />
            <Picker.Item label="Alive" value="alive" />
            <Picker.Item label="Dead" value="dead" />
            <Picker.Item label="Unknown" value="unknown" />
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.filterLabel}>Género</Text>
          <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
            <Picker.Item label="Todos" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Genderless" value="genderless" />
            <Picker.Item label="Unknown" value="unknown" />
          </Picker>
        </View>
      </View>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => fetchCharacters()}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron personajes</Text>}
      />
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCharacter && (
              <ScrollView>
                <Image source={{ uri: selectedCharacter.image }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedCharacter.name}</Text>
                <Text style={styles.modalText}><Text style={styles.bold}>Estado:</Text> {selectedCharacter.status}</Text>
                <Text style={styles.modalText}><Text style={styles.bold}>Especie:</Text> {selectedCharacter.species}</Text>
                {selectedCharacter.type ? <Text style={styles.modalText}><Text style={styles.bold}>Tipo:</Text> {selectedCharacter.type}</Text> : null}
                <Text style={styles.modalText}><Text style={styles.bold}>Género:</Text> {selectedCharacter.gender}</Text>
                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeText}>Cerrar</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pickerContainer: { flex: 1, marginRight: 6 },
  filterLabel: { fontWeight: '600', marginBottom: 4 },
  picker: { backgroundColor: '#f2f2f2', borderRadius: 8 },
  card: { flexDirection: 'row', backgroundColor: '#f4f4f4', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '85%', maxHeight: '80%' },
  modalImage: { width: 200, height: 200, borderRadius: 12, alignSelf: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  modalText: { fontSize: 16, marginBottom: 6 },
  bold: { fontWeight: 'bold' },
  closeButton: { backgroundColor: '#222', padding: 10, borderRadius: 8, marginTop: 12, alignSelf: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
});