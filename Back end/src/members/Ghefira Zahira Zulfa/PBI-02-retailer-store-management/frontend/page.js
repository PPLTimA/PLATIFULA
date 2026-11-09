 1  // Retailer: profil gerai (alamat, jam buka, dan koordinat untuk peta).
 2  (() => {
 3    const { escapeHtml: esc } = App.utils;
 4    const { head, panel, toast } = App.ui;
 5
 6    async function render() {
 7      const store = await App.api.get('/api/store');
 8      return `
 9        ${head('PENGATURAN GERAI', 'Profil gerai', 'Informasi ini tampil pada listing dan pesanan customer.')}
10        ${panel('Informasi gerai', `
11          <form id="storeForm">
12            <div class="form-grid">
13              <div class="form-field full"><label>Nama gerai</label><input class="field" name="name" required value="${esc(store.name)}"></div>
14              <div class="form-field full"><label>Alamat</label><input class="field" name="address" required value="${esc(store.address)}"></div>
15              <div class="form-field"><label>Email akun</label><input class="field" value="${esc(App.state.user.email)}" disabled></div>
16              <div class="form-field"><label>Telepon</label><input class="field" name="phone" value="${esc(store.phone)}"></div>
17              <div class="form-field"><label>Jam buka</label><input class="field" name="openTime" type="time" value="${esc(store.openTime)}"></div>
18              <div class="form-field"><label>Jam tutup</label><input class="field" name="closeTime" type="time" value="${esc(store.closeTime)}"></div>
19              <div class="form-field"><label>Latitude</label><input class="field" name="latitude" type="number" min="-90" max="90" step="any" value="${store.latitude ?? ''}" placeholder="-6.200000"></div>
20              <div class="form-field"><label>Longitude</label><input class="field" name="longitude" type="number" min="-180" max="180" step="any" value="${store.longitude ?? ''}" placeholder="106.816666"></div>
21              <div class="form-field full"><label>Deskripsi</label><textarea name="description">${esc(store.description)}</textarea></div>
22            </div>
23            <button class="btn primary" type="submit">Simpan profil</button>
24            <button class="btn" type="button" id="useStoreLocation">Ambil koordinat perangkat</button>
25            <div class="auth-error" role="alert"></div>
26          </form>`)}`;
27    }
28
29    App.events.onSubmit('#storeForm', async (form, values) => {
30      App.state.user.store = await App.api.put('/api/store', {
31        ...values,
32        latitude: values.latitude === '' ? null : Number(values.latitude),
33        longitude: values.longitude === '' ? null : Number(values.longitude),
34      });
35      await App.router.refresh();
36      toast('Profil gerai tersimpan.');
37    });
38
39    App.events.on('click', '#useStoreLocation', () => {
40      if (!navigator.geolocation) {
41        toast('Browser ini tidak mendukung akses lokasi.');
42        return;
43      }
44      navigator.geolocation.getCurrentPosition(({ coords }) => {
45        document.querySelector('#storeForm [name="latitude"]').value = coords.latitude.toFixed(6);
46        document.querySelector('#storeForm [name="longitude"]').value = coords.longitude.toFixed(6);
47        toast('Koordinat berhasil diisi. Simpan profil gerai untuk menerapkannya.');
48      }, () => toast('Lokasi tidak tersedia atau izin lokasi ditolak.'), { enableHighAccuracy: true, timeout: 10000 });
49    });
50
51    App.router.registerPage({ id: 'store', label: 'Profil gerai', icon: '⌂', roles: ['retailer'], order: 50, render });
52  })();
53  // PBI-02: retailer store profile and operating hours.