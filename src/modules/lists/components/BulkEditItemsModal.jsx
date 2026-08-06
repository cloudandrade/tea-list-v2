'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/app/components/I18nProvider';
import { useToast } from '@/app/components/ToastProvider';
import { parseItemSelection } from '@/shared/parse-item-selection';
import { compressImageFile } from '../services/imageCompression';
import styles from './lists.module.css';

const initialForm = {
  selection: '',
  name: '',
  price: '',
  quantity: '',
  description: '',
  imageUrl: '',
  applyPix: false,
  pixEnabled: true,
  pixKey: '',
  pixQrCodeUrl: '',
};

function makeImageBackground(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  const escapedUrl = String(imageUrl).replaceAll('"', '\\"');
  return { backgroundImage: `url("${escapedUrl}")` };
}

function buildFieldsPayload(form) {
  const fields = {};

  if (String(form.name || '').trim()) {
    fields.name = String(form.name).trim();
  }

  if (String(form.price || '').trim() !== '') {
    fields.price = Number(String(form.price).replace(',', '.'));
  }

  if (String(form.quantity || '').trim() !== '') {
    fields.quantity = Math.max(Number(form.quantity), 1);
  }

  if (String(form.description || '').trim()) {
    fields.description = String(form.description).trim();
  }

  if (String(form.imageUrl || '').trim()) {
    fields.imageUrl = String(form.imageUrl);
  }

  if (form.applyPix) {
    fields.pixEnabled = Boolean(form.pixEnabled);
    if (form.pixEnabled) {
      fields.pixKey = String(form.pixKey || '').trim();
      if (form.pixQrCodeUrl) {
        fields.pixQrCodeUrl = form.pixQrCodeUrl;
      }
    } else {
      fields.pixKey = '';
      fields.pixQrCodeUrl = '';
    }
  }

  return fields;
}

export default function BulkEditItemsModal({ itemCount, onClose, onSubmit }) {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const selectionResult = useMemo(
    () => parseItemSelection(form.selection, { maxNumber: itemCount }),
    [form.selection, itemCount],
  );

  const selectedCount = selectionResult.ok ? selectionResult.numbers.length : 0;

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function updateApplyPix(event) {
    const applyPix = event.target.checked;
    setForm((current) => ({
      ...current,
      applyPix,
      ...(applyPix
        ? {}
        : {
            pixEnabled: true,
            pixKey: '',
            pixQrCodeUrl: '',
          }),
    }));
  }

  function updatePixEnabled(event) {
    const pixEnabled = event.target.checked;
    setForm((current) => ({
      ...current,
      pixEnabled,
      ...(pixEnabled
        ? {}
        : {
            pixKey: '',
            pixQrCodeUrl: '',
          }),
    }));
  }

  function handleItemImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: t('lists.invalidImage') });
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

  function handlePixQrCodeChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: t('lists.invalidImage') });
      return;
    }

    compressImageFile(file, { maxWidth: 720, maxHeight: 720, quality: 0.92 })
      .then((imageDataUrl) => {
        setForm((current) => ({ ...current, pixQrCodeUrl: imageDataUrl }));
      })
      .catch((compressionError) => {
        showToast({ type: 'error', message: compressionError.message });
      });
  }

  function clearItemImage() {
    setForm((current) => ({ ...current, imageUrl: '' }));
  }

  function clearPixQrCode() {
    setForm((current) => ({ ...current, pixQrCodeUrl: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!String(form.selection || '').trim()) {
      showToast({ type: 'error', message: t('lists.bulkEditInvalidSelection') });
      return;
    }

    if (!selectionResult.ok) {
      showToast({ type: 'error', message: selectionResult.message });
      return;
    }

    const fields = buildFieldsPayload(form);

    if (Object.keys(fields).length === 0) {
      showToast({ type: 'error', message: t('lists.bulkEditEmptyFields') });
      return;
    }

    if (form.applyPix && form.pixEnabled && !String(form.pixKey || '').trim()) {
      showToast({ type: 'error', message: t('lists.pixKeyRequired') });
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        selection: form.selection.trim(),
        fields,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={saving ? undefined : onClose}>
      <section
        className={`${styles.reserveModal} ${styles.itemFormModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h3 className={styles.modalTitle} id="bulk-edit-title">
            {t('lists.bulkEditTitle')}
          </h3>
          <p className={styles.modalText}>
            {t('lists.bulkEditText', { count: itemCount })}
          </p>
        </header>

        <form className={`${styles.form} ${styles.itemFormGrid}`} onSubmit={handleSubmit}>
          <div className={styles.itemFormFields}>
            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.bulkEditSelection')}</span>
              <input
                className={styles.reserveInput}
                name="selection"
                placeholder={t('lists.bulkEditSelectionPlaceholder')}
                value={form.selection}
                onChange={updateField}
                required
              />
            </label>

            <p className={styles.bulkFieldsHint}>{t('lists.bulkEditSelectionHint')}</p>

            {selectedCount > 0 ? (
              <p className={styles.bulkSelectionHint}>
                {t('lists.bulkEditSelected', { count: selectedCount })}
              </p>
            ) : null}

            {form.selection.trim() && !selectionResult.ok ? (
              <p className={styles.bulkSelectionError}>{selectionResult.message}</p>
            ) : null}

            <p className={styles.bulkFieldsHint}>{t('lists.bulkEditFieldsHint')}</p>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.itemName')}</span>
              <input
                className={styles.reserveInput}
                name="name"
                placeholder={t('lists.bulkEditLeaveBlank')}
                value={form.name}
                onChange={updateField}
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.approximatePrice')}</span>
              <input
                className={styles.reserveInput}
                name="price"
                inputMode="decimal"
                placeholder={t('lists.bulkEditLeaveBlank')}
                value={form.price}
                onChange={updateField}
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.quantity')}</span>
              <input
                className={styles.reserveInput}
                name="quantity"
                inputMode="numeric"
                placeholder={t('lists.bulkEditLeaveBlank')}
                value={form.quantity}
                onChange={updateField}
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.descriptionOptional')}</span>
              <textarea
                className={styles.reserveInput}
                name="description"
                placeholder={t('lists.bulkEditLeaveBlank')}
                rows={4}
                value={form.description}
                onChange={updateField}
              />
            </label>

            <label className={styles.fieldPlain}>
              <span className={styles.label}>{t('lists.imageUrlOptional')}</span>
              <input
                className={styles.reserveInput}
                name="imageUrl"
                placeholder={t('lists.bulkEditLeaveBlank')}
                value={form.imageUrl}
                onChange={updateField}
              />
            </label>

            <label className={styles.pixCheckbox}>
              <input type="checkbox" checked={form.applyPix} onChange={updateApplyPix} />
              <span>{t('lists.bulkEditApplyPix')}</span>
            </label>

            {form.applyPix ? (
              <div className={styles.pixFields}>
                <label className={styles.pixCheckbox}>
                  <input type="checkbox" checked={form.pixEnabled} onChange={updatePixEnabled} />
                  <span>{t('lists.pixEnabled')}</span>
                </label>

                {form.pixEnabled ? (
                  <>
                    <label className={styles.fieldPlain}>
                      <span className={styles.label}>{t('lists.pixKey')}</span>
                      <input
                        className={styles.reserveInput}
                        name="pixKey"
                        placeholder={t('lists.pixKeyPlaceholder')}
                        value={form.pixKey}
                        onChange={updateField}
                        required
                      />
                    </label>

                    <div className={styles.fieldPlain}>
                      <span className={styles.label}>{t('lists.pixQrCodeOptional')}</span>
                      <label
                        className={`${styles.pixQrUpload} ${form.pixQrCodeUrl ? styles.pixQrUploadWithImage : ''}`}
                        style={makeImageBackground(form.pixQrCodeUrl)}
                      >
                        <input className={styles.fileInput} type="file" accept="image/*" onChange={handlePixQrCodeChange} />
                        <div>
                          <strong>{t('lists.pixQrUpload')}</strong>
                          <p>{form.pixQrCodeUrl ? t('lists.pixQrChange') : t('lists.pixQrHint')}</p>
                        </div>
                      </label>
                      {form.pixQrCodeUrl ? (
                        <button className={styles.pixQrClear} type="button" onClick={clearPixQrCode}>
                          {t('lists.pixQrClear')}
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className={styles.itemFormImagePanel}>
            <h4 className={styles.itemFormImageTitle}>{t('lists.itemImage')}</h4>
            <label
              className={`${styles.itemUpload} ${form.imageUrl ? styles.itemUploadWithImage : ''}`}
              style={makeImageBackground(form.imageUrl)}
            >
              <input className={styles.fileInput} type="file" accept="image/*" onChange={handleItemImageChange} />
              <div>
                <strong>{t('lists.uploadPhoto')}</strong>
                <p>{form.imageUrl ? t('lists.changeImage') : t('lists.bulkEditImageHint')}</p>
              </div>
            </label>
            {form.imageUrl ? (
              <button className={styles.pixQrClear} type="button" onClick={clearItemImage}>
                {t('lists.bulkEditClearImage')}
              </button>
            ) : null}
            <p className={styles.sectionText}>{t('lists.bulkEditFieldsHint')}</p>
          </aside>

          <div className={`${styles.modalActions} ${styles.itemFormActions}`}>
            <button className={styles.itemFormSecondaryButton} type="button" disabled={saving} onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button className={styles.itemFormPrimaryButton} disabled={saving} type="submit">
              {saving ? t('lists.saving') : t('lists.bulkEditSave')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
