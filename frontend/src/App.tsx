import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage.tsx'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  if (loading) return null;

  if (!user) {
    return <LoginPage />
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            Olá, <span style={{ color: 'var(--primary)' }}>{user.displayName}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Bem-vindo ao seu copiloto de relacionamentos.</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="glass-card"
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Sair
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card" 
          style={{ padding: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sparkles color="var(--accent)" size={24} />
            <h2>Dica da IA</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Você ainda não conectou nenhum relacionamento. Que tal começar criando seu próprio universo solo?
          </p>
          <button className="btn-primary" style={{ marginTop: '24px', width: '100%' }}>
            Criar Espaço
          </button>
        </motion.div>

        {/* Placeholder for future features */}
        <div className="glass-card" style={{ padding: '24px', opacity: 0.5, borderStyle: 'dashed' }}>
          <h2 style={{ marginBottom: '16px' }}>Linha do Tempo</h2>
          <p>Em breve...</p>
        </div>

        <div className="glass-card" style={{ padding: '24px', opacity: 0.5, borderStyle: 'dashed' }}>
          <h2 style={{ marginBottom: '16px' }}>Mapas do Amor</h2>
          <p>Em breve...</p>
        </div>
      </div>
    </div>
  )
}

export default App
