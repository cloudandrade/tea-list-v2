'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/ToastProvider';
import { BackIcon, PlusIcon } from '@/modules/auth/components/icons';
import { compressImageFile } from '../services/imageCompression';
import { createListItem, getList } from '../services/listApi';
import ListBottomNav from './ListBottomNav';
import styles from './lists.module.css';

const initialForm = {
  name: '',
  price: '',
  quantity: 1,
  description: '',
  imageUrl: '',
};

function makeImageBackground(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const escapedUrl = String(imageUrl).replaceAll('"', '\\"');
  return { backgroundImage: `url("${escapedUrl}")` };
}

export default function CreateItemScreen({ listId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadList() {
      try {
        const response = await getList(listId);

        if (!active) {
          return;
        }

        setList(response.list);
        setItems(response.items);
      } catch {
        router.replace('/dashboard');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadList();

    return () => {
      active = false;
    };
  }, [listId, router]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function changeQuantity(delta) {
    setForm((current) => ({ ...current, quantity: Math.max(Number(current.quantity || 1) + delta, 1) }));
  }

  function handleItemImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Selecione um arquivo de imagem válido.' });
      return;
    }

    compressImageFile(file, { maxWidth: 1000, maxHeight: 760, quality: 0.7 })
      .then((imageDataUrl) => {
        setForm((current) => ({ ...current, imageUrl: imageDataUrl }));
      })
      .catch((compressionError) => {
        showToast({ type: 'error', message: compressionError.message });
      });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await createListItem(listId, {
        ...form,
        price: Number(String(form.price).replace(',', '.')) || 0,
      });
      setItems((current) => [...current, ...(response.items || [response.item])]);
      setForm(initialForm);
      showToast({ type: 'success', message: `${response.items?.length || 1} item(ns) adicionado(s) à lista.` });
    } catch (requestError) {
      showToast({ type: 'error', message: requestError.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <section className={styles.main}>Carregando lista...</section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button className="icon-button" type="button" onClick={() => router.push('/dashboard/lists/new')} aria-label="Voltar">
          <BackIcon width="22" height="22" />
        </button>
        <h1 className={styles.topTitle}>Adicionar Itens</h1>
        <span aria-hidden="true" />
      </header>

      <section className={styles.main}>
        <div className={`${styles.stack} ${styles.stackTwoColumns}`}>
          <section className={styles.stack}>
            <form className={styles.panel} onSubmit={handleSubmit}>
              <div className={styles.form}>
                <label className={styles.fieldPlain}>
                  <span className={styles.label}>Nome do Item</span>
                  <input
                    className={styles.reserveInput}
                    name="name"
                    placeholder="Ex: Conjunto de Chá de Porcelana"
                    value={form.name}
                    onChange={updateField}
                    required
                  />
                </label>

                <label className={styles.fieldPlain}>
                  <span className={styles.label}>Preço aproximado</span>
                  <input
                    className={styles.reserveInput}
                    name="price"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    value={form.price}
                    onChange={updateField}
                  />
                </label>

                <div className={styles.fieldPlain}>
                  <span className={styles.label}>Quantidade</span>
                  <div className={styles.quantityRow}>
                    <button className={styles.quantityButton} type="button" onClick={() => changeQuantity(-1)}>
                      -
                    </button>
                    <span className={styles.quantityValue}>{form.quantity}</span>
                    <button className={styles.quantityButton} type="button" onClick={() => changeQuantity(1)}>
                      +
                    </button>
                  </div>
                </div>

                <label className={styles.fieldPlain}>
                  <span className={styles.label}>Descrição (Opcional)</span>
                  <textarea
                    className={styles.reserveInput}
                    name="description"
                    placeholder="Conte aos seus convidados por que você escolheu este item..."
                    rows={5}
                    value={form.description}
                    onChange={updateField}
                  />
                </label>

                <label className={styles.fieldPlain}>
                  <span className={styles.label}>URL da imagem (Opcional)</span>
                  <input
                    className={styles.reserveInput}
                    name="imageUrl"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={updateField}
                  />
                </label>

                <label className={styles.fileButton}>
                  <input className={styles.fileInput} type="file" accept="image/*" onChange={handleItemImageChange} />
                  Procurar imagem nos arquivos
                </label>

                <button className="primary-button" disabled={saving} type="submit">
                  <PlusIcon width="18" height="18" />
                  {saving ? 'Salvando...' : 'Salvar e adicionar outro'}
                </button>

                <div className={styles.inlineActions}>
                  <button className={styles.textButton} type="button" onClick={() => router.push(`/dashboard/lists/${listId}`)}>
                    Ver Minha Lista
                  </button>
                  <button className={styles.textButton} type="button" onClick={() => router.push(`/dashboard/lists/${listId}`)}>
                    Concluir Lista
                  </button>
                </div>
              </div>
            </form>

            <div className={styles.fieldPlain}>
              <div className={styles.inlineActions}>
                <span>Progresso da Lista</span>
                <span>
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className={styles.progress}>
                <div className={styles.progressFill} style={{ width: `${Math.min(items.length * 10, 100)}%` }} />
              </div>
            </div>
          </section>

          <aside className={styles.panel}>
            <h2 className={styles.sectionTitle}>Imagem do Item</h2>
            <label
              className={`${styles.itemUpload} ${form.imageUrl ? styles.itemUploadWithImage : ''}`}
              style={makeImageBackground(form.imageUrl)}
            >
              <input className={styles.fileInput} type="file" accept="image/*" onChange={handleItemImageChange} />
              <div>
                <strong>Upload de Foto</strong>
                <p>{form.imageUrl ? 'Clique para alterar a imagem.' : 'Informe uma URL ou clique para buscar.'}</p>
              </div>
            </label>
            <p className={styles.sectionText}>
              &quot;Uma boa imagem ajuda seus convidados a escolherem o presente perfeito.&quot;
            </p>
          </aside>
        </div>
      </section>

      <ListBottomNav active="create" />
    </main>
  );
}
