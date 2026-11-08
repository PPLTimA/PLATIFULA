// Event delegation pada area konten. Halaman dirender ulang berkali-kali, jadi pendengar
// dipasang sekali pada #content dan dicocokkan lewat selector.
//
//   App.events.on('click', '[data-delete-x]', async (button, event) => { ... });
//   App.events.onSubmit('#myForm', async (form, values) => { ... });
//
// Error yang dilempar handler otomatis tampil sebagai toast (atau di .auth-error milik form).
(() => {
  const handlers = { click: [], change: [], input: [], submit: [] };
  const attached = new Set();

  function showError(error, form) {
    const box = form?.querySelector('.auth-error');
    if (box) box.textContent = error.message;
    else App.ui.toast(error.message);
  }

  function attach(type) {
    if (attached.has(type)) return;
    attached.add(type);
    App.ui.content().addEventListener(type, async (event) => {
      for (const { selector, handler } of handlers[type]) {
        const element = event.target.closest(selector);
        if (!element || !App.ui.content().contains(element)) continue;
        try {
          await handler(element, event);
        } catch (error) {
          showError(error, element.closest('form'));
        }
      }
    });
  }

  function on(type, selector, handler) {
    handlers[type].push({ selector, handler });
    attach(type);
  }

  /** Submit form: preventDefault, tombol dinonaktifkan selama proses, error tampil di form. */
  function onSubmit(selector, handler) {
    on('submit', selector, async (form, event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"], button:not([type])');
      const errorBox = form.querySelector('.auth-error');
      if (errorBox) errorBox.textContent = '';
      if (button) button.disabled = true;
      try {
        await handler(form, App.utils.formToObject(form), event);
      } catch (error) {
        if (button) button.disabled = false;
        throw error;
      }
    });
  }

  App.events = { on, onSubmit };
})();
