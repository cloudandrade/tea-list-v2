'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNavigationLoading } from '@/app/components/NavigationLoadingProvider';
import { useToast } from '@/app/components/ToastProvider';
import { BackIcon, LogoutIcon, PlusIcon } from '@/modules/auth/components/icons';
import { logout } from '@/modules/auth/services/authApi';
import { compressImageFile } from '../services/imageCompression';
import { createList, getList, updateList } from '../services/listApi';
import ListBottomNav from './ListBottomNav';
import styles from './lists.module.css';

const celebrationTypes = ['Casamento', 'Casa Nova', 'Chá de Bebê', 'Aniversário', 'Missionário', 'Outro'];
const palettes = [
  { id: 'terracotta', color: '#86452a' },
  { id: 'olive', color: '#586330' },
  { id: 'blue', color: '#7c90a0' },
  { id: 'rose', color: '#e6a4b4' },
  { id: 'gold', color: '#d4ad68' },
];
const patterns = [
  { id: 'plain', label: 'Liso' },
  { id: 'dots', label: 'Pontilhado' },
  { id: 'stripes', label: 'Listrado' },
];
const displayModes = [
  { id: 'blocks', label: 'Blocos' },
  { id: 'detailed', label: 'Lista detalhada' },
  { id: 'compact', label: 'Lista compacta' },
];
const previewItems = [
  { name: 'Jogo de jantar artesanal', price: 'R$ 189,90', description: 'Peças delicadas para receber com carinho.' },
  { name: 'Kit café da manhã', price: 'R$ 94,00', description: 'Uma seleção charmosa para a nova rotina.' },
  { name: 'Manta decorativa', price: 'R$ 120,00', description: 'Textura macia em tons neutros.' },
  { name: 'Vaso em cerâmica', price: 'R$ 76,50', description: 'Um detalhe afetivo para compor a casa.' },
];

const emptyForm = {
  title: '',
  subtitle: '',
  type: 'Casa Nova',
  message: '',
  displayMode: 'blocks',
  colorPalette: 'terracotta',
  backgroundPattern: 'plain',
  coverImageUrl: '',
};

export default function CreateListScreen({ listId = '', mode = 'create' }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { startNavigationLoading, stopNavigationLoading } = useNavigationLoading();
  const [form, setForm] = useState(emptyForm);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [loading, setLoading] = useState(false);
  const selectedPalette = palettes.find((palette) => palette.id === form.colorPalette) || palettes[0];
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isEdit || !listId) {
      return;
    }

    let active = true;

    async function loadList() {
      try {
        const response = await getList(listId);

        if (!active) {
          return;
        }

        setForm({
          title: response.list.title || '',
          subtitle: response.list.subtitle || '',
          type: response.list.type || 'Casa Nova',
          message: response.list.message || '',
          displayMode: response.list.displayMode || 'blocks',
          colorPalette: response.list.colorPalette || 'terracotta',
          backgroundPattern: response.list.backgroundPattern || 'plain',
          coverImageUrl: response.list.coverImageUrl || '',
        });
      } catch (requestError) {
        showToast({ type: 'error', message: requestError.message });
        startNavigationLoading();
        router.replace('/dashboard');
      } finally {
        if (active) {
          setInitialLoading(false);
        }
      }
    }

    loadList();

    return () => {
      active = false;
    };
  }, [isEdit, listId, router, showToast, startNavigationLoading]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleCoverImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Selecione um arquivo de imagem válido.' });
      return;
    }

    compressImageFile(file, { maxWidth: 1400, maxHeight: 760, quality: 0.72 })
      .then((imageDataUrl) => {
        setForm((current) => ({ ...current, coverImageUrl: imageDataUrl }));
      })
      .catch((compressionError) => {
        showToast({ type: 'error', message: compressionError.message });
      });
  }

  async function handleLogout() {
    await logout();
    startNavigationLoading();
    router.replace('/');
    router.refresh();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = isEdit ? await updateList(listId, form) : await createList(form);
      startNavigationLoading();
      router.push(isEdit ? `/dashboard/lists/${response.list.id}` : `/dashboard/lists/${response.list.id}/items`);
      router.refresh();
      showToast({ type: 'success', message: isEdit ? 'Lista atualizada.' : 'Lista criada.' });
    } catch (requestError) {
      stopNavigationLoading();
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>Carregando lista...</section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className="icon-button" type="button" onClick={() => {
          startNavigationLoading();
          router.push('/dashboard');
        }} aria-label="Voltar">
          <BackIcon width="22" height="22" />
        </button>
        <h1 className={styles.topTitle}>Tea List</h1>
        <button className="icon-button" type="button" onClick={handleLogout} aria-label="Sair">
          <LogoutIcon width="22" height="22" />
        </button>
      </header>

      <section className={styles.main}>
        <form className={`${styles.stack} ${styles.stackTwoColumns}`} onSubmit={handleSubmit}>
          <section className={styles.panel}>
            <h2 className={styles.sectionTitle}>{isEdit ? 'Editar Lista' : 'Detalhes da Lista'}</h2>
            <p className={styles.sectionText}>Personalize sua celebração com detalhes que contam sua história.</p>

            <div className={styles.form}>
              <label className={styles.field}>
                <span className={styles.label}>Título da Lista</span>
                <input
                  className={`${styles.input} ${styles.titleInput}`}
                  name="title"
                  placeholder="Ex: O Casamento de Ana & João"
                  value={form.title}
                  onChange={updateField}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Subtítulo (Opcional)</span>
                <input
                  className={styles.input}
                  name="subtitle"
                  placeholder="Ex: Uma nova jornada começa aqui"
                  value={form.subtitle}
                  onChange={updateField}
                />
              </label>

              <div className={styles.fieldPlain}>
                <span className={styles.label}>Tipo de Celebração</span>
                <div className={styles.optionGrid}>
                  {celebrationTypes.map((type) => (
                    <button
                      className={`${styles.optionButton} ${form.type === type ? styles.optionButtonActive : ''}`}
                      key={type}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, type }))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldPlain}>
                <span className={styles.label}>Modo de Exibição</span>
                <div className={styles.optionGrid}>
                  {displayModes.map((mode) => (
                    <button
                      className={`${styles.optionButton} ${form.displayMode === mode.id ? styles.optionButtonActive : ''}`}
                      key={mode.id}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, displayMode: mode.id }))}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Mensagem aos Convidados (Opcional)</span>
                <textarea
                  className={styles.textarea}
                  name="message"
                  placeholder="Sua mensagem calorosa aqui..."
                  value={form.message}
                  onChange={updateField}
                />
              </label>
            </div>
          </section>

          <aside className={styles.stack}>
            <label
              className={`${styles.previewCard} ${form.coverImageUrl ? styles.previewCardWithImage : ''}`}
              style={form.coverImageUrl ? { backgroundImage: `url(${form.coverImageUrl})` } : null}
            >
              <input
                className={styles.fileInput}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
              />
              <span className={styles.previewInner}>
                {form.coverImageUrl ? 'Alterar imagem de capa' : 'Escolha uma imagem de capa'}
              </span>
            </label>

            <section className={styles.panel}>
              <h3 className={styles.sectionText}>Identidade Visual</h3>

              <div className={styles.form}>
                <div className={styles.fieldPlain}>
                  <span className={styles.label}>Paleta de Cores</span>
                  <div className={styles.paletteRow}>
                    {palettes.map((palette) => (
                      <button
                        aria-label={`Paleta ${palette.id}`}
                        className={`${styles.palette} ${form.colorPalette === palette.id ? styles.paletteActive : ''}`}
                        key={palette.id}
                        style={{ backgroundColor: palette.color }}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, colorPalette: palette.id }))}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.fieldPlain}>
                  <span className={styles.label}>Textura de Fundo</span>
                  <div className={styles.patternRow}>
                    {patterns.map((pattern) => (
                      <button
                        className={`${styles.patternButton} ${form.backgroundPattern === pattern.id ? styles.patternButtonActive : ''}`}
                        key={pattern.id}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, backgroundPattern: pattern.id }))}
                      >
                        {pattern.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.themePreviewBlock}>
                  <span className={styles.label}>Prévia do tema</span>
                  <div
                    className={`${styles.themePreview} ${styles[`themePreview${form.backgroundPattern}`]}`}
                    style={{ '--preview-color': selectedPalette.color }}
                  >
                    <div className={styles.themePreviewCard}>
                      <div className={styles.themePreviewHeader}>
                        <span className={styles.themePreviewBadge}>{form.type}</span>
                        <strong>{form.title || 'Título da sua lista'}</strong>
                        <span>{form.displayMode === 'compact' ? 'Visual compacto' : 'Visual com detalhes'}</span>
                      </div>

                      {form.displayMode === 'blocks' ? (
                        <div className={styles.previewItemsBlocks}>
                          {previewItems.map((item) => (
                            <article className={styles.previewItemBlock} key={item.name}>
                              <div className={styles.previewItemImage} />
                              <strong>{item.name}</strong>
                              <span>{item.price}</span>
                            </article>
                          ))}
                        </div>
                      ) : null}

                      {form.displayMode === 'detailed' ? (
                        <div className={styles.previewAccordion}>
                          {previewItems.map((item, index) => (
                            <article className={styles.previewAccordionItem} key={item.name}>
                              <div className={styles.previewAccordionSummary}>
                                <strong>{item.name}</strong>
                                <span>{index === 0 ? '-' : '+'}</span>
                              </div>
                              {index === 0 ? (
                                <div className={styles.previewAccordionBody}>
                                  <div className={styles.previewItemImage} />
                                  <p>{item.description}</p>
                                  <span>{item.price}</span>
                                </div>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      ) : null}

                      {form.displayMode === 'compact' ? (
                        <div className={styles.previewCompactList}>
                          {previewItems.map((item) => (
                            <div className={styles.previewCompactItem} key={item.name}>
                              <span>{item.name}</span>
                              <strong>Reservar</strong>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button className="primary-button" disabled={loading} type="submit">
                  <PlusIcon width="18" height="18" />
                  {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Salvar e Gerar Lista'}
                </button>
              </div>
            </section>
          </aside>
        </form>
      </section>

      <ListBottomNav active="create" />
    </main>
  );
}
