// Halaman Notifikasi: pengumuman platform + daftar notifikasi pribadi (semua peran).
// Lonceng, badge, dan polling ada di center.js.
(() => {
  const { escapeHtml: esc, formatDateTime } = App.utils;
  const { emptyState, head, panel } = App.ui;

  let filter = 'all'; // all | unread

  function dayLabel(value) {
    const date = new Date(value);
    const start = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diff = Math.round((start(new Date()) - start(date)) / 86400000);
    return diff === 0 ? 'Hari ini' : diff === 1 ? 'Kemarin' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function groupedList(items) {
    if (!items.length) {
      return filter === 'unread'
        ? emptyState('✓', 'Semua sudah dibaca', 'Tidak ada notifikasi yang belum dibaca.', '', true)
        : emptyState('✦', 'Belum ada notifikasi', 'Notifikasi baru akan muncul di sini.', '', true);
    }
    const groups = [];
    items.forEach((item) => {
      const label = dayLabel(item.createdAt);
      const last = groups[groups.length - 1];
      if (last?.label === label) last.items.push(item);
      else groups.push({ label, items: [item] });
    });
    return groups.map((group) => `
      <div class="notif-group-label">${esc(group.label)}</div>
      <div class="notif-list">${group.items.map((item) => App.notifications.itemHtml(item)).join('')}</div>`).join('');
  }

  async function render() {
    const [notifications, announcements] = await Promise.all([
      App.api.get('/api/notifications'),
      App.api.get('/api/announcements'),
    ]);
    const unread = notifications.filter((item) => !item.read).length;
    const shown = filter === 'unread' ? notifications.filter((item) => !item.read) : notifications;

    const announcementList = announcements.map((item) => `
      <div class="activity"><div><b>${esc(item.title)}</b><p>${esc(item.body)}</p><time>${formatDateTime(item.createdAt)}</time></div></div>`).join('')
      || emptyState('✦', 'Belum ada pengumuman', 'Pengumuman admin akan tampil di sini.', '', true);

    const tabs = `
      <div class="pill-tabs notif-tabs">
        <button type="button" class="${filter === 'all' ? 'active' : ''}" data-notif-filter="all">Semua (${notifications.length})</button>
        <button type="button" class="${filter === 'unread' ? 'active' : ''}" data-notif-filter="unread">Belum dibaca (${unread})</button>
        ${unread ? '<button type="button" class="notif-tabs-action" data-notif-read-all>Tandai semua dibaca</button>' : ''}
      </div>`;

    return `
      ${head('AKTIVITAS', 'Notifikasi', 'Pemberitahuan pesanan, verifikasi, dan pengumuman platform.')}
      ${panel('Notifikasi', tabs + groupedList(shown))}
      ${panel('Pengumuman', announcementList)}`;
  }

  App.events.on('click', '[data-notif-filter]', async (button) => {
    filter = button.dataset.notifFilter;
    await App.router.refresh();
  });

  App.events.on('click', '[data-notif-read-all]', () => App.notifications.readAll());

  App.events.on('click', '[data-notification-read]', async (button) => {
    await App.api.patch(`/api/notifications/${encodeURIComponent(button.dataset.notificationRead)}`);
    await App.router.refresh();
    App.notifications.refresh();
  });

  App.events.on('click', '[data-notification-delete]', async (button) => {
    await App.api.delete(`/api/notifications/${encodeURIComponent(button.dataset.notificationDelete)}`);
    await App.router.refresh();
    App.notifications.refresh();
  });

  // Klik baris notifikasi (bukan tombolnya) membuka halaman terkait.
  App.events.on('click', '#content [data-notif-open]', (row, event) => {
    if (event.target.closest('button')) return;
    return App.notifications.openItem(row.dataset.notifOpen);
  });

  App.router.registerPage({
    id: 'notifications', label: 'Notifikasi', icon: '✦', roles: ['customer', 'retailer', 'admin'], order: 800, render,
  });
})();
