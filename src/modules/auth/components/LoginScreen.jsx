'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { login } from '../services/authApi';
import { ArrowRightIcon, EyeIcon, LeafIcon, MailIcon, TeaCupIcon } from './icons';
import styles from './auth.module.css';

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);
      router.push('/dashboard');
      router.refresh();
    } catch (requestError) {
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
            <TeaCupIcon />
            <span className={styles.leafBadge}>
              <LeafIcon />
            </span>
          </div>
          <h1 className={styles.brandTitle}>Tea List</h1>
          <p className={styles.brandText}>Curate your perfect celebration, one thoughtful gift at a time.</p>
        </div>

        <section className={styles.authCard}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Welcome back</h2>
            <p className={styles.eyebrow}>Access your registry</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span className={styles.label}>Email Address</span>
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
                <span className={styles.label}>Password</span>
                <button className={styles.forgot} type="button">
                  Forgot?
                </button>
              </span>
              <span className={styles.inputWrap}>
                <input
                  className={styles.input}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={updateField}
                  required
                />
                <EyeIcon className={styles.fieldIcon} />
              </span>
            </label>

            <button className="primary-button" disabled={loading} type="submit">
              {loading ? 'Entrando...' : 'Sign in to Account'}
              <ArrowRightIcon width="18" height="18" />
            </button>
          </form>

        </section>

        <footer className={styles.authFooter}>
          <p className={styles.switchText}>
            New to the community? <Link href="/register">Register for an account</Link>
          </p>
          <p className={styles.finePrint}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Help Center</span>
          </p>
        </footer>
      </section>
    </main>
  );
}
