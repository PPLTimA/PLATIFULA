// Retailer: profil gerai (alamat, jam buka, dan koordinat untuk peta).
(() => {
  const { escapeHtml: esc } = App.utils;
  const { head, panel, toast } = App.ui;

  async function render() {
    const store = await App.api.get('/api/store');
    return `
      ${head('PENGATURAN GERAI', 'Profil gerai', 'Informasi ini tampil pada listing dan pesanan customer.')}
      ${panel('Informasi gerai', `
        <form id="storeForm">
          <div class="form-grid">
            <div class="form-field full"><label>Nama gerai</label><input class="field" name="name" required value="${esc(store.name)}"></div>
            <div class="form-field full"><label>Alamat</label><input class="field" name="address" required value="${esc(store.address)}"></div>
            <div class="form-field"><label>Email akun</label><input class="field" value="${esc(App.state.user.email)}" disabled></div>
            <div class="form-field"><label>Telepon</label><input class="field" name="phone" value="${esc(store.phone)}"></div>
            <div class="form-field"><label>Jam buka</label><input class="field" name="openTime" type="time" value="${esc(store.openTime)}"></div>
            <div class="form-field"><label>Jam tutup</label><input class="field" name="closeTime" type="time" value="${esc(store.closeTime)}"></div>
            <div class="form-field"><label>Latitude</label><input class="field" name="latitude" type="number" min="-90" max="90" step="any" value="${store.latitude ?? ''}" placeholder="-6.200000"></div>
            <div class="form-field"><label>Longitude</label><input class="field" name="longitude" type="number" min="-180" max="180" step="any" value="${store.longitude ?? ''}" placeholder="106.816666"></div>
            <div class="form-field full"><label>Deskripsi</label><textarea name="description">${esc(store.description)}</textarea></div>
          </div>
          <button class="btn primary" type="submit">Simpan profil</button>
          <button class="btn" type="button" id="useStoreLocation">Ambil koordinat perangkat</button>
          <div class="auth-error" role="alert"></div>
        </form>`)}`;
  }

  App.events.onSubmit('#storeForm', async (form, values) => {
    App.state.user.store = await App.api.put('/api/store', {
      ...values,
      latitude: values.latitude === '' ? null : Number(values.latitude),
      longitude: values.longitude === '' ? null : Number(values.longitude),
    });
    await App.router.refresh();
    toast('Profil gerai tersimpan.');
  });

  App.events.on('click', '#useStoreLocation', () => {
    if (!navigator.geolocation) {
      toast('Browser ini tidak mendukung akses lokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      document.querySelector('#storeForm [name="latitude"]').value = coords.latitude.toFixed(6);
      document.querySelector('#storeForm [name="longitude"]').value = coords.longitude.toFixed(6);
      toast('Koordinat berhasil diisi. Simpan profil gerai untuk menerapkannya.');
    }, () => toast('Lokasi tidak tersedia atau izin lokasi ditolak.'), { enableHighAccuracy: true, timeout: 10000 });
  });

  App.router.registerPage({ id: 'store', label: 'Profil gerai', icon: '⌂', roles: ['retailer'], order: 50, render });
})();
