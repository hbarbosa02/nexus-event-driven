import React from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [health, setHealth] = React.useState<string>('...')

  React.useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(d.status))
      .catch(() => setHealth('error'))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Web</h1>
      <p>API health: {health}</p>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
