// VeloUp chat demos (home and How it works), missed-enquiry calculator, step line. Plain JavaScript, no libraries.
// If anything fails, or "reduce motion" is on, each demo shows its finished conversation.
(function () {
  'use strict';
  var still = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    /[?&]motion=still/.test(location.search);
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // 1. Chat demos: one industry plays at a time; tabs switch industry; matching notes pop out with their message
  each(document.querySelectorAll('.stage'), function (stage) {
    var chats = stage.querySelectorAll('.demo-chat');
    var tabs = stage.querySelectorAll('.scene-tab');
    var nameEl = stage.querySelector('.phone-name');
    var typing = stage.querySelector('.dm-typing');
    if (!chats.length) { return; }
    var current = 0, timers = [], auto = !still, visible = true, running = false;

    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var noteFor = function (i, n) { return stage.querySelector('.note[data-scene="' + i + '"][data-n="' + n + '"]'); };
    var show = function (m, i) {
      m.classList.add('is-on');
      var note = m.dataset.note && noteFor(i, m.dataset.note);
      if (note) { note.classList.add('is-on'); }
    };

    var activate = function (i, play) {
      clear();
      current = i;
      running = play;
      each(chats, function (c, k) { c.hidden = k !== i; });
      each(stage.querySelectorAll('.note'), function (n) { n.hidden = Number(n.dataset.scene) !== i; n.classList.remove('is-on'); });
      each(tabs, function (t, k) { t.setAttribute('aria-pressed', String(k === i)); });
      if (nameEl) { nameEl.textContent = chats[i].dataset.biz; }
      var msgs = chats[i].querySelectorAll('.dm');
      each(msgs, function (m) { m.classList.remove('is-on'); });
      if (typing) { typing.classList.remove('is-on'); }
      if (!play) { each(msgs, function (m) { show(m, i); }); return; }

      var last = 0;
      each(msgs, function (m) {
        var t = Number(m.dataset.t);
        last = Math.max(last, t);
        if (typing && m.classList.contains('dm-out')) {
          timers.push(setTimeout(function () { m.parentNode.insertBefore(typing, m); typing.classList.add('is-on'); }, t - 900));
        }
        timers.push(setTimeout(function () { if (typing) { typing.classList.remove('is-on'); } show(m, i); }, t));
      });
      if (auto) {
        var hold = last + 4000;
        stage.style.setProperty('--scene-ms', hold + 'ms');
        timers.push(setTimeout(function () { activate((i + 1) % chats.length, true); }, hold));
      }
    };

    each(tabs, function (tab, k) {
      tab.addEventListener('click', function () {
        auto = false; // the visitor chose an industry, so stop rotating
        stage.classList.add('is-manual');
        activate(k, !still);
      });
    });

    if (still) { activate(0, false); return; }
    stage.classList.add('demo-ready');
    // Play only while the demo is on screen and the tab is visible
    // Only (re)start a paused demo; layout changes re-fire the observer and must not restart a running scene
    var resume = function () {
      if (visible && !document.hidden) { if (!running) { activate(current, true); } } else { clear(); running = false; }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; resume(); }, { threshold: 0.25 }).observe(stage);
    } else {
      activate(0, true);
    }
    document.addEventListener('visibilitychange', resume);
  });

  // 2. Calculator: revenue at risk = missed enquiries x share who would buy x average sale (an estimate)
  var calc = document.getElementById('calc');
  if (calc) {
    var rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    var val = function (id) { return Number(document.getElementById('calc-' + id).value); };
    var out = function (id, text) { document.getElementById(id).textContent = text; };
    var update = function () {
      each(calc.querySelectorAll('input[type="range"]'), function (el) {
        el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%');
      });
      var missed = Math.round(val('e') * val('u') / 100);
      var amount = Math.round(missed * val('c') / 100 * val('v'));
      out('calc-e-out', val('e'));
      out('calc-u-out', val('u') + '%');
      out('calc-v-out', rupees.format(val('v')));
      out('calc-c-out', val('c') + '%');
      out('calc-amt', rupees.format(amount));
      out('calc-how', 'Estimate: ' + missed + ' missed enquiries × ' + val('c') + '% who would have bought × ' +
        rupees.format(val('v')) + '. Your real numbers will differ.');
      if (!still) {
        var amt = document.getElementById('calc-amt');
        amt.classList.remove('is-bump');
        void amt.offsetWidth; // restart the bump animation
        amt.classList.add('is-bump');
      }
    };
    calc.addEventListener('input', update);
    update();
  }

  // 3. Steps: the dotted line fills as you scroll, ending at the cyan step 3
  var wrap = document.getElementById('loop-steps');
  if (wrap) {
    var fill = wrap.querySelector('.fill');
    var steps = wrap.querySelectorAll('.loop-step');
    var onScroll = function () {
      var r = wrap.getBoundingClientRect();
      var p = still ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (window.innerHeight * 0.5)));
      if (fill) { fill.style.setProperty('--o', 1 - p); }
      each(steps, function (s, i) { s.classList.toggle('is-done', p >= i / 2 - 0.001); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();
