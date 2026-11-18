// PBI-05: tampilan dokumen izin usaha (PDF atau gambar) yang dipakai halaman retailer dan admin.
(() => {
  const { escapeHtml: esc } = App.utils;
  const registry = new Map();

  const isPdf = (doc) => doc?.type === 'application/pdf';

  /** Perkiraan ukuran file dari data URL base64. */
  function sizeLabel(doc) {
    const encoded = String(doc.data || '').split(',')[1] || '';
    const bytes = Math.floor((encoded.length * 3) / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function toBlobUrl(doc) {
    const binary = atob(String(doc.data).split(',')[1] || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: doc.type }));
  }

  /** HTML dokumen: pratinjau gambar atau kartu PDF, plus tombol Buka dan Unduh. */
  function render(doc, key = 'document') {
    if (!doc?.data) return '<p class="muted">Belum ada dokumen yang diunggah.</p>';
    registry.set(key, doc);
    const name = doc.name || (isPdf(doc) ? 'dokumen.pdf' : 'dokumen');
    const preview = isPdf(doc)
      ? `<div class="doc-file"><span class="doc-file-icon" aria-hidden="true">PDF</span>
           <div><b>${esc(name)}</b><small>Dokumen PDF · ${sizeLabel(doc)}</small></div></div>`
      : `<img class="doc-image" src="${esc(doc.data)}" alt="Dokumen izin usaha">
         <small class="muted">${esc(name)} · ${sizeLabel(doc)}</small>`;
    return `
      <div class="doc-view">
        ${preview}
        <div class="btn-row">
          <button class="btn sm" type="button" data-doc-open="${esc(key)}">Buka di tab baru</button>
          <button class="btn sm" type="button" data-doc-download="${esc(key)}">Unduh</button>
        </div>
      </div>`;
  }

  App.events.on('click', '[data-doc-open]', (button) => {
    const doc = registry.get(button.dataset.docOpen);
    if (!doc) return;
    const url = toBlobUrl(doc);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });

  App.events.on('click', '[data-doc-download]', (button) => {
    const doc = registry.get(button.dataset.docDownload);
    if (!doc) return;
    const url = toBlobUrl(doc);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name || (isPdf(doc) ? 'dokumen.pdf' : 'dokumen');
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });

  App.verificationDocument = { render, isPdf, sizeLabel };
})();
