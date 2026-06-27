'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { useToast } from '@/app/components/ToastProvider';
import { register } from '../services/authApi';
import { BackIcon, EyeIcon, GearIcon } from './icons';
import styles from './auth.module.css';

export default function RegisterScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { startNavigationLoading, stopNavigationLoading } = useNavigationLoading();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast({ type: 'error', message: 'As senhas precisam ser iguais.' });
      return;
    }

    setLoading(true);

    try {
      await register({ name: form.name, email: form.email, password: form.password });
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
    <main className={styles.registerPage}>
      <header className={styles.topBar}>
        <Link className="icon-button" href="/" aria-label="Voltar para login">
          <BackIcon width="22" height="22" />
        </Link>
        <h1 className={styles.topTitle}>Tea List</h1>
        <button className="icon-button" type="button" aria-label="Configurações">
          <GearIcon width="22" height="22" />
        </button>
      </header>

      <section className={styles.registerMain}>
        <form className={styles.registerCard} onSubmit={handleSubmit}>
          <div className={styles.registerHeader}>
            <h2 className={styles.registerTitle}>Criar Conta</h2>
            <p className={styles.registerSubtitle}>Join Tea List today.</p>
          </div>

          <label className={styles.field}>
            <span className={styles.registerLabel}>Name</span>
            <input
              className={styles.registerInput}
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={updateField}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.registerLabel}>Email</span>
            <input
              className={styles.registerInput}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.registerLabel}>Password</span>
            <span className={styles.inputWrap}>
              <input
                className={styles.registerInput}
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={updateField}
                required
              />
              <EyeIcon className={styles.fieldIcon} />
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.registerLabel}>Confirm Password</span>
            <input
              className={styles.registerInput}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={updateField}
              required
            />
          </label>

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>

          <p className={styles.registerSwitch}>
            Already have an account? <Link href="/">Sign In</Link>
          </p>

        </form>
      </section>
    </main>
  );
}
