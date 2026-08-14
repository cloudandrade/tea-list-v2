export default function Loading() {
  return (
    <main className="app-loading-screen" aria-live="polite" aria-busy="true">
      <div className="app-loading-inline">
        <span className="app-spinner app-spinner-large" aria-hidden="true" />
      </div>
    </main>
  );
}
