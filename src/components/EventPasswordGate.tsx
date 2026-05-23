import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { hashPassword } from '@/lib/crypto';
import type { Event } from '@/types/database';

interface EventPasswordGateProps {
  event: Event;
  onUnlock: () => void;
}

export function EventPasswordGate({ event, onUnlock }: EventPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    const hash = await hashPassword(password.trim());
    if (hash === event.password_hash) {
      try { sessionStorage.setItem(`lume-unlocked-${event.id}`, '1'); } catch { /* quota */ }
      onUnlock();
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--theme-light, #F5F3FF)' }}
    >
      <div className="w-full max-w-sm">
        {/* Icon + title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--theme-primary, #8B5CF6), var(--theme-primary-hover, #7C3AED))` }}
          >
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-2xl font-display font-bold mb-1"
            style={{ color: 'var(--theme-primary, #8B5CF6)' }}
          >
            {event.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--theme-secondary, #C084FC)' }}>
            Este evento é protegido com senha
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="Senha do evento"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="w-full h-12 px-4 rounded-xl border text-center text-base tracking-widest outline-none transition-all"
            style={{
              borderColor: error ? '#ef4444' : 'var(--theme-accent, #DDD6FE)',
              background: 'white',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--theme-primary, #8B5CF6)')}
            onBlur={e => (e.target.style.borderColor = error ? '#ef4444' : 'var(--theme-accent, #DDD6FE)')}
          />

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full h-12 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(to right, var(--theme-primary, #8B5CF6), var(--theme-primary-hover, #7C3AED))` }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
            ) : (
              'Entrar no Evento'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
