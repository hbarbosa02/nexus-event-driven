import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users')
        setUsers(response.data)
      } catch (err) {
        setError('Erro ao carregar usuários')
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Monorepo WEB</h1>
        <p>Aplicação React conectada à API</p>
      </header>

      <main className="main-content">
        <section className="users-section">
          <h2>👥 Usuários</h2>
          
          {loading && <p className="loading">Carregando usuários...</p>}
          
          {error && <p className="error">{error}</p>}
          
          {!loading && !error && (
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Monorepo configurado com sucesso! 🎉</p>
      </footer>
    </div>
  )
}

export default App