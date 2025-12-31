import { useEffect, useMemo, useState } from 'react'
import { createRelationship, fetchPeople } from './api'
import './styles.css'

const RELATION_TYPES = [
  { value: 'amistad', label: 'Amistad' },
  { value: 'amistad_fuerte', label: 'Amistad fuerte' }
]

export default function App() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [personA, setPersonA] = useState('')
  const [personB, setPersonB] = useState('')
  const [relationType, setRelationType] = useState('amistad')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchPeople(search)
      .then((data) => {
        if (isMounted) {
          setPeople(data)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setMessage(error.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [search])

  const peopleOptions = useMemo(
    () => people.map((person) => ({ value: person.id, label: `${person.nombre} (${person.curso})` })),
    [people]
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    if (!personA || !personB) {
      setMessage('Selecciona ambas personas antes de guardar')
      return
    }
    try {
      await createRelationship({
        persona_a_id: Number(personA),
        persona_b_id: Number(personB),
        tipo: relationType
      })
      setMessage('Relación guardada correctamente')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Mapa de Relaciones</h1>
        <p>Declara relaciones bidireccionales entre estudiantes.</p>
      </header>

      <section className="panel">
        <div className="field">
          <label htmlFor="search">Buscar estudiante</label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o ID"
          />
        </div>

        {loading ? (
          <p className="muted">Cargando estudiantes...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid">
              <div className="field">
                <label>Persona A</label>
                <select value={personA} onChange={(event) => setPersonA(event.target.value)}>
                  <option value="">Selecciona</option>
                  {peopleOptions.map((person) => (
                    <option key={`a-${person.value}`} value={person.value}>
                      {person.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Persona B</label>
                <select value={personB} onChange={(event) => setPersonB(event.target.value)}>
                  <option value="">Selecciona</option>
                  {peopleOptions.map((person) => (
                    <option key={`b-${person.value}`} value={person.value}>
                      {person.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Tipo de relación</label>
              <select value={relationType} onChange={(event) => setRelationType(event.target.value)}>
                {RELATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit">Guardar relación</button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </section>
    </div>
  )
}
