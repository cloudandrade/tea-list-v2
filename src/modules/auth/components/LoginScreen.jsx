'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { useToast } from '@/app/components/ToastProvider';
import { login } from '../services/authApi';
import { ArrowRightIcon, EyeIcon, MailIcon } from './icons';
import styles from './auth.module.css';

const SAVED_LOGIN_KEY = 'tea-list-v2:saved-login';

function getSavedLogin() {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedLogin = window.localStorage.getItem(SAVED_LOGIN_KEY);

  if (!savedLogin) {
    return null;
  }

  try {
    return JSON.parse(savedLogin);
  } catch {
    window.localStorage.removeItem(SAVED_LOGIN_KEY);
    return null;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useI18n();
  const { startNavigationLoading, stopNavigationLoading } = useNavigationLoading();
  const [form, setForm] = useState(() => {
    const savedLogin = getSavedLogin();

    return {
      email: savedLogin?.email || '',
      password: savedLogin?.password || '',
    };
  });
  const [rememberLogin, setRememberLogin] = useState(() => Boolean(getSavedLogin()));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateRememberLogin(event) {
    const checked = event.target.checked;
    setRememberLogin(checked);

    if (!checked) {
      window.localStorage.removeItem(SAVED_LOGIN_KEY);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);

      if (rememberLogin) {
        window.localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify(form));
      } else {
        window.localStorage.removeItem(SAVED_LOGIN_KEY);
      }

      startNavigationLoading();
      router.push('/dashboard');
      router.refresh();
    } catch (requestError) {
      stopNavigationLoading();
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell} aria-label="Login Tea List">
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <Image alt="" src="/tea-list-logo.png" width={80} height={80} priority />
          </div>
          <h1 className={styles.brandTitle}>Tea List</h1>
          <p className={styles.brandText}>{t('auth.tagline')}</p>
        </div>

        <section className={styles.authCard}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{t('auth.welcomeBack')}</h2>
            <p className={styles.eyebrow}>{t('auth.accessRegistry')}</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>{t('auth.email')}</span>
              <span className={styles.inputWrap}>
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="hello@tealist.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
                <MailIcon className={styles.fieldIcon} />
              </span>
            </label>

            <label className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>{t('auth.password')}</span>
                <button className={styles.forgot} type="button">
                  {t('auth.forgot')}
                </button>
              </span>
              <span className={styles.inputWrap}>
                <input
                  className={styles.input}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={updateField}
                  required
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon />
                </button>
              </span>
            </label>

            <label className={styles.rememberLogin}>
              <input type="checkbox" checked={rememberLogin} onChange={updateRememberLogin} />
              <span>{t('auth.remember')}</span>
            </label>

            <button className="primary-button" disabled={loading} type="submit">
              {loading ? t('auth.signingIn') : t('auth.signIn')}
              <ArrowRightIcon width="18" height="18" />
            </button>
          </form>

        </section>

        <footer className={styles.authFooter}>
          <p className={styles.switchText}>
            {t('auth.newCommunity')} <Link href="/register">{t('auth.registerLink')}</Link>
          </p>
          <p className={styles.finePrint}>
            <span>{t('auth.privacy')}</span>
            <span>•</span>
            <span>{t('auth.terms')}</span>
            <span>•</span>
            <span>{t('auth.help')}</span>
          </p>
        </footer>
      </section>
    </main>
  );
}
