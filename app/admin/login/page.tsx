'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/eduven/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Credenciais invalidas')
      }
    } catch {
      setError('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050d1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1rem',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#0c1320',
          border: '1px solid rgba(100,116,139,0.3)',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Lock icon */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1
          style={{
            color: '#e2e8f0',
            fontSize: '1.25rem',
            fontWeight: 600,
            textAlign: 'center',
            margin: 0,
          }}
        >
          Admin — O Interativo Mundo da NR
        </h1>

        {error && (
          <div
            style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              textAlign: 'center',
              padding: '0.5rem',
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderRadius: '6px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
            style={{
              backgroundColor: '#050d1a',
              border: '1px solid rgba(100,116,139,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            style={{
              backgroundColor: '#050d1a',
              border: '1px solid rgba(100,116,139,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#e2e8f0',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading
              ? 'rgba(34,211,238,0.3)'
              : 'linear-gradient(135deg, #22d3ee, #3b82f6)',
            color: '#050d1a',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            marginTop: '0.5rem',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
