// VeloUp contact form: checks the fields, then sends them to the Google Apps Script address in config.js.
// Also fills in the email address on the contact page from config.js.
(function () {
  'use strict';
  var cfg = window.config || {};

  var emailSpot = document.querySelector('[data-email]');
  if (emailSpot) {
    var e = String(cfg.businessEmail || '');
    if (e && e.indexOf('[') === -1) {
      var a = document.createElement('a');
      a.href = 'mailto:' + e; a.textContent = e;
      emailSpot.textContent = ''; emailSpot.appendChild(a);
    } else { emailSpot.textContent = e; }
  }
  var numSpot = document.querySelector('[data-number]');
  if (numSpot) { numSpot.textContent = String(cfg.whatsappNumber || ''); }

  var form = document.getElementById('contact-form');
  if (!form) { return; }
  var status = document.getElementById('form-status');
  var button = form.querySelector('button[type="submit"]');

  function setError(field, message) {
    var input = form.elements[field];
    var box = document.getElementById(field + '-error');
    if (message) { input.setAttribute('aria-invalid', 'true'); box.textContent = message; }
    else { input.removeAttribute('aria-invalid'); box.textContent = ''; }
    return !message;
  }

  function validate() {
    var v = function (n) { return form.elements[n].value.trim(); };
    var ok = true;
    ok = setError('name', v('name').length < 2 ? 'Please enter your name.' : '') && ok;
    var email = v('email'), phone = v('phone');
    ok = setError('email', email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Please enter a valid email address.' : '') && ok;
    ok = setError('phone', phone && phone.replace(/\D/g, '').length < 8 ? 'Please enter a valid phone number.' : '') && ok;
    ok = setError('message', v('message').length < 10 ? 'Please write a short message (at least 10 characters).' : '') && ok;
    if (ok && !email && !phone) {
      ok = setError('phone', 'Please give a phone number or an email so we can reply.');
    }
    if (!ok) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) { first.focus(); }
    }
    return ok;
  }

  function show(kind, text) { status.className = 'form-status ' + kind; status.textContent = text; }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (form.elements.website.value) { return; }            // spam trap: real visitors never fill this
    if (!validate()) { return; }

    var endpoint = String(cfg.formEndpoint || '');
    if (!/^https:\/\//i.test(endpoint)) {
      show('is-error', 'The form is not switched on yet. Please message us on WhatsApp or use the email address on this page.');
      return;
    }

    button.disabled = true;
    show('is-ok', 'Sending...');
    var body = new URLSearchParams({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      message: form.elements.message.value.trim(),
      website: '',
      page: location.origin + location.pathname
    });
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () {
        form.reset();
        show('is-ok', 'Thank you. We have your message and will reply soon.');
        button.disabled = false;
      })
      .catch(function () {
        show('is-error', 'Sorry, that did not send. Please message us on WhatsApp or email us instead.');
        button.disabled = false;
      });
  });
})();
