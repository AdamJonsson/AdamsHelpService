// Adams Hjälptjänst: sidans logik (presentöppning, tjänstedialog, varukorg och kassa).
(function () {
  const { icon, hydrateIcons } = window.Icons;
  const { SERVICES, CURRENCY, CURRENCY_ORDER, amount, totals, totalsText, esc } = window.HelpServices;
  const CONFIG = window.HELP_CONFIG;

  const $ = (sel, root = document) => root.querySelector(sel);
  const byId = (id) => SERVICES.find((s) => s.id === id);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(key, fallback, area = 'localStorage') {
      try { const v = window[area].getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value, area = 'localStorage') {
      try { window[area].setItem(key, JSON.stringify(value)); } catch { /* lagring är inte nödvändig */ }
    },
  };

  const picture = (slug, alt, sizes, cls = '', eager = false) =>
    `<img class="${cls}" src="assets/web/${slug}-600.webp" srcset="assets/web/${slug}-600.webp 600w, assets/web/${slug}-1200.webp 1200w"
      sizes="${sizes}" alt="${esc(alt)}" width="600" height="804" ${eager ? '' : 'loading="lazy"'} decoding="async">`;

  function totalsHTML(list, cls = '') {
    return `<ul class="totals ${cls}">${list.map((t) => `
      <li class="totals__item" title="${amount(t.key, t.n)}">${icon(t.key)}<span class="totals__n" aria-hidden="true">×${t.n}</span><span class="sr-only">${amount(t.key, t.n)}</span></li>`).join('')}
    </ul>`;
  }

  // ---------- Konfetti ----------
  const CONFETTI_COLORS = ['#E8899F', '#B9D88A', '#CFE3A6', '#F2D27A', '#2E4A33', '#FFFFFF'];
  function celebrate(origin = { x: 0.5, y: 0.5 }, big = true) {
    if (!window.confetti || reducedMotion()) return;
    const base = { colors: CONFETTI_COLORS, zIndex: 3000, disableForReducedMotion: true, scalar: 1.1 };
    window.confetti({ ...base, particleCount: big ? 140 : 70, spread: 80, startVelocity: big ? 48 : 34, origin });
    if (!big) return;
    setTimeout(() => {
      window.confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } });
      window.confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } });
    }, 250);
  }

  // ---------- Toast ----------
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message, action) {
    toastEl.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button" class="toast__action">${esc(action.label)}</button>` : ''}`;
    // Öppna dialoger ligger i top layer, så toasten måste bo i dialogen för att synas.
    const host = document.querySelector('dialog[open]') || document.body;
    if (toastEl.parentElement !== host) host.appendChild(toastEl);
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    if (action) $('.toast__action', toastEl).addEventListener('click', () => { hideToast(); action.run(); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }
  function hideToast() {
    toastEl.classList.remove('is-visible');
    setTimeout(() => { toastEl.hidden = true; }, 250);
  }

  // =====================================================================
  // Startsidan
  // =====================================================================
  const SHORT = { frogs: 'Grodor', reach: 'Hyllor', math: 'Matte', movie: 'Film' };

  function renderHero() {
    $('#hero-stack').innerHTML = SERVICES.map((s, i) => `
      <button type="button" class="stack-card" data-open="${s.id}" style="--i:${i}" aria-label="Beställ ${s.name}">
        ${picture(s.image, s.alt, '(min-width: 900px) 260px, 45vw', '', true)}
        <span class="stack-card__label">${SHORT[s.id]}</span>
      </button>`).join('');
  }

  function renderServices() {
    $('#services-grid').innerHTML = SERVICES.map((s) => `
      <article class="service">
        <div class="service__media">${picture(s.image, s.alt, '(min-width: 1000px) 300px, (min-width: 640px) 45vw, 92vw')}</div>
        <div class="service__body">
          <h3 class="service__name">${s.name}</h3>
          <p class="service__tagline">${s.tagline}</p>
          <div class="service__from">
            <span class="service__from-icons" aria-hidden="true">${s.from.map((f) => icon(f.key)).join('')}</span>
            <span>Från ${totalsText(s.from)}</span>
          </div>
          <button type="button" class="btn btn--primary service__cta" data-open="${s.id}">Anpassa och beställ</button>
        </div>
      </article>`).join('');
  }

  function renderCurrency() {
    $('#currency-list').innerHTML = CURRENCY_ORDER.map((k) => `
      <li class="coin">
        <span class="coin__icon">${icon(k)}</span>
        <span class="coin__text"><strong>${CURRENCY[k].name}</strong><span>${CURRENCY[k].note}</span></span>
      </li>`).join('');
  }

  // =====================================================================
  // Presentöppning
  // =====================================================================
  const gift = $('#gift');

  function showGift() {
    gift.hidden = false;
    gift.classList.remove('is-opening', 'is-leaving');
    document.documentElement.classList.add('is-locked');
    $('#gift-open').focus();
  }

  function closeGift() {
    store.set('ahj-gift-opened', true, 'sessionStorage');
    gift.classList.add('is-leaving');
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => { gift.hidden = true; }, reducedMotion() ? 0 : 600);
  }

  function initGift() {
    $('#gift-open').addEventListener('click', () => {
      if (gift.classList.contains('is-opening')) return;
      gift.classList.add('is-opening');
      const r = $('.gift__box', gift).getBoundingClientRect();
      setTimeout(() => celebrate({ x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.3) / innerHeight }), reducedMotion() ? 0 : 350);
      setTimeout(closeGift, reducedMotion() ? 300 : 1500);
    });
    $('#gift-skip').addEventListener('click', closeGift);
    gift.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGift(); });
    $('#gift-replay').addEventListener('click', () => { window.scrollTo({ top: 0 }); showGift(); });
    if (!store.get('ahj-gift-opened', false, 'sessionStorage')) showGift();
  }

  // =====================================================================
  // Tjänstedialog
  // =====================================================================
  const sheet = $('#service-dialog');
  const drafts = {};
  let current = null;

  function openService(id) {
    const svc = byId(id);
    if (!svc) return;
    current = svc;
    const state = drafts[id] || (drafts[id] = svc.initialState());

    const img = $('#sheet-img');
    img.src = `assets/web/${svc.image}-1200.webp`;
    img.alt = svc.alt;
    $('#sheet-title').textContent = svc.name;
    $('#sheet-intro').textContent = svc.intro;
    sheet.dataset.service = svc.id;
    // Absolut adress, annars tolkas url() relativt till css-mappen.
    sheet.style.setProperty('--sheet-img', `url("${new URL(`assets/web/${svc.image}-600.webp`, document.baseURI).href}")`);

    const fresh = document.createElement('div');
    fresh.className = 'config';
    fresh.id = 'sheet-config';
    $('#sheet-config').replaceWith(fresh);
    svc.render(fresh, state, updateSheet);
    updateSheet();
    $('#sheet-hint').classList.remove('is-shake');

    sheet.showModal();
    $('.sheet__body', sheet).scrollTop = 0;
  }

  function updateSheet() {
    if (!current) return;
    const state = drafts[current.id];
    const lines = current.price(state);
    const sum = totals(lines);
    const error = current.validate(state);

    $('#sheet-price').innerHTML = sum.length
      ? `<span class="price__label">Pris</span>${totalsHTML(sum)}`
      : `<span class="price__label">Pris</span><span class="price__empty">Räknas ut när du har valt</span>`;

    $('#sheet-receipt').innerHTML = lines.length ? `
      <p class="receipt__title">Fikanota</p>
      <ul class="receipt__lines">
        ${lines.map((l) => `<li><span>${esc(l.label)}</span><span class="receipt__amt">${amount(l.key, l.n)}</span></li>`).join('')}
      </ul>
      <p class="receipt__total"><span>Totalt</span><span>${totalsText(sum)}</span></p>` : '';
    $('#sheet-receipt').hidden = !lines.length;

    const hint = $('#sheet-hint');
    hint.textContent = error;
    $('#sheet-add').setAttribute('aria-disabled', String(!!error));
  }

  function addCurrentToCart() {
    const svc = current;
    const state = drafts[svc.id];
    const error = svc.validate(state);
    if (error) {
      const hint = $('#sheet-hint');
      hint.classList.remove('is-shake'); void hint.offsetWidth; hint.classList.add('is-shake');
      return;
    }
    cart.push({ uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), id: svc.id, summary: svc.summary(state), lines: svc.price(state) });
    saveCart();
    delete drafts[svc.id];
    sheet.close();
    toast(`${svc.name} ligger i varukorgen.`, { label: 'Visa varukorg', run: () => openCart('cart') });
  }

  function initSheet() {
    $('#sheet-add').addEventListener('click', addCurrentToCart);
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet || e.target.closest('[data-close]')) sheet.close();
    });
  }

  // =====================================================================
  // Varukorg och kassa
  // =====================================================================
  const drawer = $('#cart-dialog');
  const drawerBody = $('#drawer-body');
  const drawerFoot = $('#drawer-foot');
  let cart = store.get('ahj-cart-v1', []).filter((item) => byId(item.id));
  let view = 'cart';
  const checkout = { name: CONFIG.CUSTOMER_NAME, when: '', message: '', payment: 'hemma' };
  let lastOrder = null;

  const PAYMENTS = [
    { value: 'hemma', label: 'Fika hemma hos mig', desc: 'Adam kommer förbi och äter upp betalningen.' },
    { value: 'tamed', label: 'Jag tar med fika till Adam', desc: 'Leverans direkt till soffan.' },
    { value: 'kafe', label: 'Vi går på kafé', desc: 'Du bjuder. Det räknas.' },
  ];
  const BLOCKED = ['Swish', 'Kort', 'Kontanter'];

  function saveCart() {
    store.set('ahj-cart-v1', cart);
    const count = $('#cart-count');
    count.textContent = cart.length;
    count.classList.toggle('is-empty', cart.length === 0);
    const btn = $('#cart-open');
    btn.classList.remove('is-bump'); void btn.offsetWidth;
    if (cart.length) btn.classList.add('is-bump');
  }

  const allLines = () => cart.flatMap((i) => i.lines);

  function openCart(nextView = 'cart') {
    view = nextView;
    hideToast();
    renderDrawer();
    if (!drawer.open) drawer.showModal();
  }

  function renderDrawer() {
    const title = $('#drawer-title');
    drawer.dataset.view = view;
    if (view === 'cart') {
      title.textContent = 'Din beställning';
      renderCartView();
    } else if (view === 'checkout') {
      title.textContent = 'Kassan';
      renderCheckoutView();
    } else {
      title.textContent = 'Tack, ' + (lastOrder.name.split(' ')[0] || 'Helena') + '!';
      renderDoneView();
    }
    drawerBody.scrollTop = 0;
  }

  function renderCartView() {
    if (!cart.length) {
      drawerBody.innerHTML = `
        <div class="empty">
          <span class="empty__icon">${icon('bulle')}</span>
          <p class="empty__title">Varukorgen är tom</p>
          <p>Välj en tjänst, så räknar vi ut vad det kostar i fika.</p>
        </div>`;
      drawerFoot.innerHTML = `<button type="button" class="btn btn--primary btn--block" data-action="browse">Visa tjänster</button>`;
      return;
    }
    drawerBody.innerHTML = `<ul class="cart-list">${cart.map((item) => {
      const svc = byId(item.id);
      return `<li class="cart-item">
        <img class="cart-item__img" src="assets/web/${svc.image}-600.webp" alt="" width="64" height="86">
        <div class="cart-item__body">
          <p class="cart-item__name">${svc.name}</p>
          <ul class="cart-item__summary">${item.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          ${totalsHTML(totals(item.lines), 'totals--sm')}
        </div>
        <button type="button" class="icon-btn icon-btn--sm" data-remove="${item.uid}" aria-label="Ta bort ${svc.name}">${icon('trash')}</button>
      </li>`;
    }).join('')}</ul>
    <button type="button" class="link-btn" data-action="browse">${icon('plus')} Lägg till fler tjänster</button>`;
    drawerFoot.innerHTML = `
      <div class="drawer__total">
        <span>Att betala</span>
        ${totalsHTML(totals(allLines()))}
      </div>
      <p class="drawer__total-text">${totalsText(totals(allLines()))}</p>
      <button type="button" class="btn btn--primary btn--block" data-action="checkout">Gå till kassan</button>`;
  }

  function renderCheckoutView() {
    drawerBody.innerHTML = `
      <button type="button" class="link-btn" data-action="back">${icon('back')} Tillbaka till varukorgen</button>
      <form class="checkout" id="checkout-form" novalidate>
        <label class="field">
          <span class="field__label">Ditt namn</span>
          <input class="input" name="name" autocomplete="name" required value="${esc(checkout.name)}">
          <span class="field__error" id="name-error" hidden>Skriv ditt namn, så vet Adam vem bullarna kommer från.</span>
        </label>
        <label class="field">
          <span class="field__label">När passar det?</span>
          <input class="input" name="when" value="${esc(checkout.when)}" placeholder="T.ex. lördag eftermiddag">
        </label>
        <fieldset class="field">
          <legend class="field__label">Hur vill du betala?</legend>
          <div class="pay">
            ${PAYMENTS.map((p) => `
              <label class="pay__opt">
                <input type="radio" name="payment" value="${p.value}" ${checkout.payment === p.value ? 'checked' : ''}>
                <span class="pay__box"><strong>${p.label}</strong><span>${p.desc}</span></span>
              </label>`).join('')}
            <div class="pay__blocked">
              ${BLOCKED.map((b) => `<button type="button" class="pay__no" data-blocked aria-describedby="pay-msg"><s>${b}</s></button>`).join('')}
            </div>
            <p class="pay__msg" id="pay-msg" aria-live="polite"></p>
          </div>
        </fieldset>
        <label class="field">
          <span class="field__label">Meddelande till Adam</span>
          <textarea class="input" name="message" rows="3" maxlength="400" placeholder="Valfritt">${esc(checkout.message)}</textarea>
        </label>
      </form>`;
    drawerFoot.innerHTML = `
      <div class="drawer__total">
        <span>Att betala</span>
        ${totalsHTML(totals(allLines()))}
      </div>
      <button type="submit" form="checkout-form" class="btn btn--primary btn--block">${icon('mail')} Skicka beställning</button>`;

    const form = $('#checkout-form');
    form.addEventListener('input', () => {
      const data = new FormData(form);
      checkout.name = data.get('name');
      checkout.when = data.get('when');
      checkout.message = data.get('message');
      checkout.payment = data.get('payment');
      if (checkout.name.trim()) $('#name-error').hidden = true;
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); submitOrder(); });
  }

  function orderText(order) {
    const lines = [
      `Hej ${CONFIG.PROVIDER_NAME}!`,
      '',
      'Jag vill beställa hjälp från Adams Hjälptjänst.',
      '',
      `Ordernummer: ${order.id}`,
      `Beställare: ${order.name}`,
    ];
    if (order.when) lines.push(`Passar bäst: ${order.when}`);
    lines.push('');
    order.items.forEach((item, i) => {
      const svc = byId(item.id);
      lines.push(`${i + 1}. ${svc.name}`);
      item.summary.forEach((s) => lines.push(`   - ${s}`));
      lines.push(`   Pris: ${totalsText(totals(item.lines))}`);
      lines.push('');
    });
    lines.push(`Att betala totalt: ${order.total}`);
    lines.push(`Betalsätt: ${order.payment}`);
    if (order.message) lines.push('', 'Meddelande:', order.message);
    lines.push('', 'Hälsningar,', order.name.split(' ')[0]);
    return lines.join('\r\n');
  }

  function mailtoFor(order) {
    const subject = `Beställning ${order.id}: ${order.items.map((i) => byId(i.id).name).join(', ')}`;
    return `mailto:${CONFIG.ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderText(order))}`;
  }

  function submitOrder() {
    if (!checkout.name.trim()) {
      $('#name-error').hidden = false;
      $('#checkout-form [name="name"]').focus();
      return;
    }
    const now = new Date();
    const id = `HW-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;
    lastOrder = {
      id,
      name: checkout.name.trim(),
      when: checkout.when.trim(),
      message: checkout.message.trim(),
      payment: PAYMENTS.find((p) => p.value === checkout.payment).label,
      items: cart.slice(),
      total: totalsText(totals(allLines())),
    };
    lastOrder.mailto = mailtoFor(lastOrder);

    window.location.href = lastOrder.mailto;

    cart = [];
    saveCart();
    checkout.when = '';
    checkout.message = '';
    view = 'done';
    renderDrawer();
    const r = drawer.getBoundingClientRect();
    celebrate({ x: (r.left + r.width / 2) / innerWidth, y: 0.35 }, false);
  }

  function renderDoneView() {
    const o = lastOrder;
    drawerBody.innerHTML = `
      <div class="done">
        <span class="done__badge">${icon('check')}</span>
        <p class="done__title">Beställningen är på väg till Adam</p>
        <p>Din mejlapp har öppnats med beställningen ifylld. Tryck på skicka där, så är det klart.</p>
        <div class="ticket">
          <div class="ticket__row"><span>Ordernummer</span><strong>${o.id}</strong></div>
          <div class="ticket__row"><span>Tjänster</span><strong>${o.items.map((i) => byId(i.id).name).join(', ')}</strong></div>
          <div class="ticket__row"><span>Att betala</span><strong>${o.total}</strong></div>
          <div class="ticket__row"><span>Betalsätt</span><strong>${o.payment}</strong></div>
          <div class="ticket__row"><span>Status</span><strong>Inväntar fika</strong></div>
        </div>
        <p class="done__help">Öppnades ingen mejlapp? Kopiera beställningen och skicka den som sms eller mejl till Adam.</p>
      </div>`;
    drawerFoot.innerHTML = `
      <div class="done__actions">
        <button type="button" class="btn btn--ghost" data-action="copy">${icon('copy')} Kopiera</button>
        <a class="btn btn--ghost" href="${esc(o.mailto)}">${icon('mail')} Öppna mejlet</a>
      </div>
      <button type="button" class="btn btn--primary btn--block" data-action="close">Klar</button>`;
  }

  async function copyOrder() {
    const text = orderText(lastOrder);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      drawer.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast('Beställningen är kopierad.');
  }

  function initDrawer() {
    $('#cart-open').addEventListener('click', () => openCart('cart'));
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer || e.target.closest('[data-close]')) { drawer.close(); return; }
      const remove = e.target.closest('[data-remove]');
      if (remove) {
        cart = cart.filter((i) => i.uid !== remove.dataset.remove);
        saveCart();
        renderDrawer();
        return;
      }
      const blocked = e.target.closest('[data-blocked]');
      if (blocked) {
        const msg = $('#pay-msg');
        msg.textContent = 'Adams Hjälptjänst tar inte emot pengar. Bara bullar.';
        blocked.classList.remove('is-shake'); void blocked.offsetWidth; blocked.classList.add('is-shake');
        return;
      }
      const action = e.target.closest('[data-action]');
      if (!action) return;
      switch (action.dataset.action) {
        case 'checkout': view = 'checkout'; renderDrawer(); break;
        case 'back': view = 'cart'; renderDrawer(); break;
        case 'browse':
          drawer.close();
          document.getElementById('tjanster').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
          break;
        case 'copy': copyOrder(); break;
        case 'close': drawer.close(); break;
      }
    });
    drawer.addEventListener('close', () => { if (view === 'done') view = 'cart'; });
  }

  // =====================================================================
  // Start
  // =====================================================================
  function init() {
    hydrateIcons();
    renderHero();
    renderServices();
    renderCurrency();
    initGift();
    initSheet();
    initDrawer();
    saveCart();
    $('#cart-open').classList.remove('is-bump');

    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-open]');
      if (opener) openService(opener.dataset.open);
    });
  }

  init();
})();
