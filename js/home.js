// VeloUp home page: WhatsApp demo, missed-enquiry calculator, step line. Plain JavaScript, no libraries.
// If anything fails, or "reduce motion" is on, the demo shows its finished conversation.
(function () {
  'use strict';
  var still = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    /[?&]motion=still/.test(location.search);

  // 1. WhatsApp demo: messages arrive on a timeline; each sticky note pops out with its message
  var stage = document.querySelector('.stage');
  var chat = document.getElementById('demo-chat');
  if (stage && chat && !still) {
    var msgs = Array.prototype.slice.call(chat.querySelectorAll('.dm'));
    var typing = chat.querySelector('.dm-typing');
    var timers = [];
    var show = function (m) {
      m.classList.add('is-on');
      if (m.dataset.note) { stage.querySelector('.note-' + m.dataset.note).classList.add('is-on'); }
    };
    var run = function () {
      timers.forEach(clearTimeout);
      timers = [];
      if (document.hidden) { timers.push(setTimeout(run, 2000)); return; }
      Array.prototype.forEach.call(stage.querySelectorAll('.is-on'), function (el) { el.classList.remove('is-on'); });
      msgs.forEach(function (m) {
        var t = +m.dataset.t;
        if (m.classList.contains('dm-out')) {
          timers.push(setTimeout(function () { chat.insertBefore(typing, m); typing.classList.add('is-on'); }, t - 900));
        }
        timers.push(setTimeout(function () { typing.classList.remove('is-on'); show(m); }, t));
      });
      timers.push(setTimeout(run, 13000));
    };
    stage.classList.add('demo-ready');
    run();
  }

  // 2. Calculator: revenue at risk = missed enquiries x share who would buy x average sale (an estimate)
  var calc = document.getElementById('calc');
  if (calc) {
    var rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    var val = function (id) { return Number(document.getElementById('calc-' + id).value); };
    var out = function (id, text) { document.getElementById(id).textContent = text; };
    var update = function () {
      Array.prototype.forEach.call(calc.querySelectorAll('input[type="range"]'), function (el) {
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
      Array.prototype.forEach.call(steps, function (s, i) { s.classList.toggle('is-done', p >= i / 2 - 0.001); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();
