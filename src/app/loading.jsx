export default function Loading() {
  return (
    <main className="app-loading-screen" aria-live="polite" aria-busy="true">
      <div className="app-loading-card">
        <span className="app-spinner" aria-hidden="true" />
        <p className="app-loading-title">Carregando Tea List</p>
        <p className="app-loading-text">Só um instante...</p>
      </div>
    </main>
  );
}
