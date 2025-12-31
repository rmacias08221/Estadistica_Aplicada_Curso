import { useEffect, useState } from 'react'
import { SafeAreaView, Text, View, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

export default function App() {
  const [search, setSearch] = useState('')
  const [people, setPeople] = useState([])
  const [personA, setPersonA] = useState(null)
  const [personB, setPersonB] = useState(null)
  const [relationType, setRelationType] = useState('amistad')

  useEffect(() => {
    fetch(`${API_URL}/people?search=${encodeURIComponent(search)}`)
      .then((response) => response.json())
      .then((data) => setPeople(data))
      .catch(() => setPeople([]))
  }, [search])

  const handleSave = async () => {
    if (!personA || !personB) {
      Alert.alert('Selecciona ambas personas antes de guardar')
      return
    }
    const response = await fetch(`${API_URL}/relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona_a_id: personA.id,
        persona_b_id: personB.id,
        tipo: relationType
      })
    })
    if (!response.ok) {
      const error = await response.json()
      Alert.alert(error.detail || 'No se pudo guardar la relación')
      return
    }
    Alert.alert('Relación guardada')
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Mapa de Relaciones</Text>
      <Text style={styles.subtitle}>Declara relaciones bidireccionales entre estudiantes.</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar estudiante"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Persona A</Text>
        {people.slice(0, 5).map((person) => (
          <TouchableOpacity
            key={`a-${person.id}`}
            style={[styles.option, personA?.id === person.id && styles.optionSelected]}
            onPress={() => setPersonA(person)}
          >
            <Text>{person.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Persona B</Text>
        {people.slice(0, 5).map((person) => (
          <TouchableOpacity
            key={`b-${person.id}`}
            style={[styles.option, personB?.id === person.id && styles.optionSelected]}
            onPress={() => setPersonB(person)}
          >
            <Text>{person.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tipo de relación</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.tag, relationType === 'amistad' && styles.tagSelected]}
            onPress={() => setRelationType('amistad')}
          >
            <Text>Amistad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tag, relationType === 'amistad_fuerte' && styles.tagSelected]}
            onPress={() => setRelationType('amistad_fuerte')}
          >
            <Text>Amistad fuerte</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Guardar relación</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa'
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4,
    color: '#52606d'
  },
  input: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd2d9',
    backgroundColor: '#fff'
  },
  section: {
    marginTop: 16
  },
  label: {
    fontWeight: '600',
    marginBottom: 8
  },
  option: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8
  },
  optionSelected: {
    borderWidth: 1,
    borderColor: '#2563eb'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0'
  },
  tagSelected: {
    backgroundColor: '#bfdbfe'
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 999,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff',
    fontWeight: '600'
  }
})
