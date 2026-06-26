'use client';

import { useCallback, useEffect, useState } from 'react';

const CHECK_URL = '/api/v2/health/mongo';

export default function AppStartup({ children }) {
  const [status, setStatus] = useState({ state: 'checking', message: '', target: '' });

  const checkMongo = useCallback(async () => {
    try {
      const response = await fetch(CHECK_URL, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        const connectionError = new Error(data.details || data.error || 'MongoDB indisponível.');
        connectionError.target = data.target;
        throw connectionError;
      }

      setStatus({ state: 'ready', message: '', target: data.target || '' });
    } catch (error) {
      setStatus({
        state: 'error',
        message: error.message || 'Não foi possível conectar ao MongoDB.',
        target: error.target || '',
      });
    }
  }, []);

  function handleRetry() {
    setStatus({ state: 'checking', message: '', target: '' });
    checkMongo();
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      checkMongo();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [checkMongo]);

  if (status.state === 'checking') {
    return (
      <main className="app-loading-screen" aria-live="polite" aria-busy="true">
        <div className="app-loading-card">
          <span className="app-spinner" aria-hidden="true" />
          <p className="app-loading-title">Preparando Tea List</p>
          <p className="app-loading-text">Verificando conexão com o MongoDB...</p>
        </div>
      </main>
    );
  }

  if (status.state === 'error') {
    return (
      <main className="app-loading-screen">
        <div className="app-loading-card">
          <p className="app-loading-title">MongoDB indisponível</p>
          <p className="app-loading-text">
            A aplicação iniciou, mas não conseguiu conectar ao banco. Verifique as variáveis de ambiente ou se o
            MongoDB está rodando.
          </p>
          {status.target ? <p className="app-loading-target">Alvo: {status.target}</p> : null}
          <p className="app-loading-detail">{status.message}</p>
          <button className="primary-button" type="button" onClick={handleRetry}>
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return children;
}
