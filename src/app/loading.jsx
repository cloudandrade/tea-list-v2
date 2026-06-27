'use client';

import { useI18n } from './components/I18nProvider';

export default function Loading() {
  const { t } = useI18n();

  return (
    <main className="app-loading-screen" aria-live="polite" aria-busy="true">
      <div className="app-loading-card">
        <span className="custom-loading-spinner custom-loading-spinner-large" aria-hidden="true" />
        <p className="app-loading-title">{t('common.loadingTeaList')}</p>
        <p className="app-loading-text">{t('common.justMoment')}</p>
      </div>
    </main>
  );
}
