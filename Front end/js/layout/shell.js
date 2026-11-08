// Kerangka aplikasi di sekitar konten: sidebar, menu sesuai peran, kartu misi, dan profil mini.
(() => {
  const { escapeHtml: esc, initials } = App.utils;

  const ROLE_LABEL = { admin: 'Staff admin', retailer: 'Retailer', customer: 'Customer' };
  const NAV_LABEL = { admin: 'ADMINISTRASI', retailer: 'PENGELOLAAN GERAI', customer: 'MENU UTAMA' };
  const MISSIONS = {
    admin: { icon: '🧑‍🌾', title: 'Penjaga kebaikan', note: 'Bantu jaga komunitas tetap aman.', page: 'moderation', action: 'Lihat laporan' },
    retailer: { icon: '🥕', title: 'Panen surplus', note: 'Ada makanan yang siap berbagi?', page: 'products', action: 'Tambah listing' },
    customer: { icon: '🍓', title: 'Misi kecil hari ini', note: 'Satu pack terselamatkan itu berarti!', page: 'discover', action: 'Cari deal' },
  };

  function renderNavigation(user) {
    document.getElementById('nav').innerHTML = `
      <div class="nav-label">${NAV_LABEL[user.role]}</div>
      ${App.router.pagesFor(user.role).map((page) => `
        <button class="nav-item" data-page="${page.id}">
          <span>${page.icon || '▦'}</span>${esc(page.label)}
        </button>`).join('')}`;
  }

  function renderMission(user) {
    const mission = MISSIONS[user.role];
    let card = document.querySelector('.sidebar-mission');
    if (!card) {
      card = document.createElement('section');
      card.className = 'sidebar-mission';
      document.getElementById('nav').after(card);
    }
    card.innerHTML = `
      <div class="mission-mascots" aria-hidden="true"><span>${mission.icon}</span><i>✦</i><b>·</b></div>
      <span class="mission-kicker">LITTLE GOOD THING</span>
      <h3>${mission.title}</h3>
      <p>${mission.note}</p>
      <button type="button" data-goto="${mission.page}">${mission.action}<span aria-hidden="true">↗</span></button>`;
  }

  function renderProfile(user) {
    document.querySelector('.workspace').innerHTML = `
      <span class="dot"></span>${ROLE_LABEL[user.role]}
      <span class="chev">⌄</span>`;

    const subtitle = user.role === 'retailer'
      ? user.store?.name || 'Retailer'
      : user.role === 'admin' ? 'Platform staff' : 'Customer account';
    document.querySelectorAll('.profile-mini b').forEach((el) => { el.textContent = user.name; });
    document.querySelectorAll('.profile-mini small').forEach((el) => { el.textContent = subtitle; });
    document.querySelectorAll('.profile-mini .avatar, .top-actions .avatar').forEach((el) => {
      el.textContent = initials(user.name);
    });
  }

  /** Menyegarkan sidebar dan profil sesuai user yang login. */
  function update() {
    const { user } = App.state;
    if (!user) return;
    renderNavigation(user);
    renderMission(user);
    renderProfile(user);
  }

  document.getElementById('nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (button) App.router.navigate(button.dataset.page);
  });

  App.shell = { update };
})();
