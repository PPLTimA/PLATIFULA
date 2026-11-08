// Satu-satunya tempat yang berbicara dengan backend lewat fetch.
(() => {
  async function request(path, { method = 'GET', body } = {}) {
    let response;
    try {
      response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new Error('Backend PLATIFUL tidak terhubung. Jalankan server dengan `npm start` dari folder Back end.');
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      if (window.location.port === '5500') {
        throw new Error('Kamu membuka Live Server. Buka aplikasi di http://localhost:3000.');
      }
      throw new Error('Server mengirim respons yang tidak dikenali. Pastikan backend PLATIFUL berjalan di port 3000.');
    }

    if (!response.ok) {
      // Sesi habis di tengah pemakaian: kembali ke halaman login.
      if (response.status === 401 && App.state.user && !path.startsWith('/api/auth/')) {
        App.state.user = null;
        App.router.navigate('login');
        App.ui.toast('Sesimu berakhir. Silakan masuk lagi.');
      }
      throw new Error(data.error || 'Permintaan gagal.');
    }
    return data;
  }

  App.api = {
    request,
    get: (path) => request(path),
    post: (path, body = {}) => request(path, { method: 'POST', body }),
    put: (path, body = {}) => request(path, { method: 'PUT', body }),
    patch: (path, body = {}) => request(path, { method: 'PATCH', body }),
    delete: (path, body) => request(path, { method: 'DELETE', ...(body ? { body } : {}) }),
  };
})();
