// Tjänster, priser och beställningsformulär.
(function () {
  const { icon } = window.Icons;

  // ---------- Betalmedel ----------
  const CURRENCY = {
    bulle:     { one: 'kanelbulle',        many: 'kanelbullar',        name: 'Kanelbulle',      note: 'Grundvalutan. Används till nästan allt.' },
    kaffe:     { one: 'kopp kaffe',        many: 'koppar kaffe',       name: 'Kaffe',           note: 'Per påbörjad arbetsinsats.' },
    kladdkaka: { one: 'bit kladdkaka',     many: 'bitar kladdkaka',    name: 'Kladdkaka',       note: 'Tillägg vid stress och höjder.' },
    tarta:     { one: 'bit prinsesstårta', many: 'bitar prinsesstårta', name: 'Prinsesstårta',  note: 'För akuta lägen. Och födelsedagar.' },
    middag:    { one: 'hemlagad middag',   many: 'hemlagade middagar', name: 'Hemlagad middag', note: 'Större uppdrag, som jättegrodor.' },
    godis:     { one: 'påse godis',        many: 'påsar godis',        name: 'Påse godis',      note: 'Filmkvällens officiella valuta.' },
  };
  const CURRENCY_ORDER = ['bulle', 'kaffe', 'kladdkaka', 'tarta', 'middag', 'godis'];

  const amount = (key, n) => `${n} ${n === 1 ? CURRENCY[key].one : CURRENCY[key].many}`;

  function totals(lines) {
    const sum = {};
    lines.forEach((l) => { sum[l.key] = (sum[l.key] || 0) + l.n; });
    return CURRENCY_ORDER.filter((k) => sum[k] > 0).map((k) => ({ key: k, n: sum[k] }));
  }

  function totalsText(list) {
    const parts = list.map((t) => amount(t.key, t.n));
    if (parts.length <= 1) return parts.join('');
    return `${parts.slice(0, -1).join(', ')} och ${parts[parts.length - 1]}`;
  }

  // ---------- Små byggstenar för formulären ----------
  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function field(label, content, help = '') {
    return `<fieldset class="field">
      <legend class="field__label">${label}</legend>
      ${help ? `<p class="field__help">${help}</p>` : ''}
      ${content}
    </fieldset>`;
  }

  function chips(name, options, { multi = false, variant = 'chips' } = {}) {
    return `<div class="${variant}" data-group="${name}" data-multi="${multi}">
      ${options.map((o) => `<button type="button" class="chip" data-value="${o.value}" aria-pressed="false">
        ${o.emoji ? `<span class="chip__emoji" aria-hidden="true">${o.emoji}</span>` : ''}<span>${o.label}</span>
      </button>`).join('')}
    </div>`;
  }

  function stepper(name, { min = 0, max = 10, label = '' } = {}) {
    return `<div class="stepper" data-stepper="${name}" data-min="${min}" data-max="${max}">
      <button type="button" class="stepper__btn" data-step="-1" aria-label="Minska ${label}">${icon('minus')}</button>
      <output class="stepper__value" aria-live="polite">0</output>
      <button type="button" class="stepper__btn" data-step="1" aria-label="Öka ${label}">${icon('plus')}</button>
    </div>`;
  }

  // Kopplar ihop chips, stegräknare och textfält med state.
  function bindControls(root, state, onChange) {
    root.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-group] .chip');
      if (chip && !chip.disabled) {
        const group = chip.closest('[data-group]');
        const name = group.dataset.group;
        const value = chip.dataset.value;
        if (group.dataset.multi === 'true') {
          const list = state[name];
          const i = list.indexOf(value);
          if (i >= 0) list.splice(i, 1); else list.push(value);
        } else {
          state[name] = value;
        }
        syncControls(root, state);
        onChange(name);
        return;
      }
      const stepBtn = e.target.closest('[data-stepper] [data-step]');
      if (stepBtn) {
        const st = stepBtn.closest('[data-stepper]');
        const name = st.dataset.stepper;
        const next = state[name] + Number(stepBtn.dataset.step);
        if (next < Number(st.dataset.min) || next > Number(st.dataset.max)) return;
        state[name] = next;
        syncControls(root, state);
        onChange(name);
      }
    });
    root.addEventListener('input', (e) => {
      const el = e.target.closest('[data-field]');
      if (!el) return;
      const name = el.dataset.field;
      state[name] = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value);
      onChange(name);
    });
  }

  function syncControls(root, state) {
    root.querySelectorAll('[data-group]').forEach((group) => {
      const v = state[group.dataset.group];
      group.querySelectorAll('.chip').forEach((chip) => {
        const on = Array.isArray(v) ? v.includes(chip.dataset.value) : v === chip.dataset.value;
        chip.setAttribute('aria-pressed', String(on));
      });
    });
    root.querySelectorAll('[data-stepper]').forEach((st) => {
      const v = state[st.dataset.stepper];
      st.querySelector('output').textContent = v;
      st.querySelector('[data-step="-1"]').disabled = v <= Number(st.dataset.min);
      st.querySelector('[data-step="1"]').disabled = v >= Number(st.dataset.max);
    });
    root.querySelectorAll('[data-field]').forEach((el) => {
      const v = state[el.dataset.field];
      if (el.type === 'checkbox') el.checked = !!v;
      else if (document.activeElement !== el && v !== undefined) el.value = v;
    });
  }

  const labelOf = (options, value) => (options.find((o) => o.value === value) || {}).label || value;

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================================
  // 1. Grodborttagning
  // =====================================================================
  const FROG_SIZES = [
    { value: 'liten', label: 'Liten', like: 'Som en tumme', one: 'liten groda', many: 'små grodor', w: 7, max: 15 },
    { value: 'mellan', label: 'Mellan', like: 'Som en mobil', one: 'mellanstor groda', many: 'mellanstora grodor', w: 10, max: 12 },
    { value: 'stor', label: 'Stor', like: 'Som ett paket smör', one: 'stor groda', many: 'stora grodor', w: 14, max: 8 },
    { value: 'jatte', label: 'Jättegroda', like: 'Har egen postadress', one: 'jättegroda', many: 'jättegrodor', w: 21, max: 3 },
  ];
  const FROG_URGENCY = [
    { value: 'vanta', label: 'Kan vänta', emoji: '🐢' },
    { value: 'idag', label: 'Idag, tack', emoji: '⏰' },
    { value: 'nu', label: 'NU!!!', emoji: '😱' },
  ];
  const FROG_DEST = [
    { value: 'damm', label: 'Närmaste dammen', emoji: '💧' },
    { value: 'skog', label: 'Ut i skogen', emoji: '🌲' },
    { value: 'kiruna', label: 'Långt bort, typ Kiruna', emoji: '🏔️' },
    { value: 'granne', label: 'Grannens trädgård', emoji: '🤫' },
  ];

  let frogId = 0;

  const frogs = {
    id: 'frogs',
    name: 'Grodborttagning',
    tagline: 'Grodor flyttas ut ur trädgården. Varsamt men bestämt.',
    intro: 'Visa Adam hur läget ser ut. Lägg till grodorna du har sett, i rätt storlek. Tryck på en groda i trädgården om den har hoppat iväg av sig själv.',
    image: 'frog-hunt',
    alt: 'Illustration: Adam i grön hoodie jagar grodor över gräsmattan i en trädgård.',
    from: [{ key: 'bulle', n: 1 }],

    initialState: () => ({ frogs: [], urgency: 'idag', destination: 'damm', guarantee: false }),

    counts(state) {
      const c = { liten: 0, mellan: 0, stor: 0, jatte: 0 };
      state.frogs.forEach((f) => { c[f.size] += 1; });
      return c;
    },

    render(root, state, onChange) {
      root.innerHTML = `
        <div class="garden" id="garden">
          <div class="garden__fence" aria-hidden="true"></div>
          <div class="garden__pond" aria-hidden="true"></div>
          <span class="garden__flower" style="left:6%;top:44%" aria-hidden="true">🌷</span>
          <span class="garden__flower" style="left:12%;top:40%" aria-hidden="true">🌷</span>
          <span class="garden__flower" style="left:92%;top:40%" aria-hidden="true">🌼</span>
          <span class="garden__flower" style="left:44%;top:41%" aria-hidden="true">🌼</span>
          <p class="garden__count" aria-live="polite"></p>
          <p class="garden__empty">Inga grodor rapporterade än.<br>Lägg till dem nedan.</p>
        </div>

        ${field('Hur många grodor, och hur stora?', `
          <div class="frog-sizes">
            ${FROG_SIZES.map((s) => `
              <div class="frog-size">
                <div class="frog-size__pic" aria-hidden="true"><span style="width:${14 + s.w * 2.8}px">${icon('frog')}</span></div>
                <p class="frog-size__name">${s.label}</p>
                <p class="frog-size__like">${s.like}</p>
                ${stepper('size_' + s.value, { min: 0, max: s.max, label: `antal: ${s.label.toLowerCase()}` })}
              </div>`).join('')}
          </div>`)}

        ${field('Hur bråttom är det?', chips('urgency', FROG_URGENCY, { variant: 'segmented' }))}
        ${field('Vart ska grodorna?', chips('destination', FROG_DEST))}
        ${field('Tillval', `
          <label class="toggle">
            <input type="checkbox" data-field="guarantee">
            <span class="toggle__track" aria-hidden="true"></span>
            <span><strong>Grodfri-garanti.</strong> Adam patrullerar trädgården i en vecka efteråt.</span>
          </label>`)}
      `;

      const garden = root.querySelector('#garden');

      // Stegräknarna per storlek speglar grodorna i trädgården.
      const syncSizeSteppers = () => {
        const c = frogs.counts(state);
        FROG_SIZES.forEach((s) => { state['size_' + s.value] = c[s.value]; });
      };

      const placeFrog = (f, animate) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'garden__frog' + (animate ? ' is-new' : '');
        btn.dataset.id = f.id;
        const size = FROG_SIZES.find((s) => s.value === f.size);
        btn.style.cssText = `left:${f.x}%;top:${f.y}%;--w:${size.w}%;--flip:${f.flip ? -1 : 1};z-index:${Math.round(f.y)}`;
        btn.setAttribute('aria-label', `Ta bort ${size.one}`);
        btn.innerHTML = icon('frog');
        garden.appendChild(btn);
      };

      const updateGarden = () => {
        const n = state.frogs.length;
        garden.querySelector('.garden__count').textContent = n === 1 ? '1 groda' : `${n} grodor`;
        garden.classList.toggle('is-empty', n === 0);
      };

      // Väljer den av några slumpade platser som ligger längst från grodorna som redan sitter där.
      const freeSpot = () => {
        let best = null;
        for (let i = 0; i < 16; i++) {
          const x = 8 + Math.random() * 80;
          const y = 50 + Math.random() * 38;
          const gap = Math.min(Infinity, ...state.frogs.map((f) => Math.hypot(f.x - x, (f.y - y) * 0.6)));
          if (!best || gap > best.gap) best = { x, y, gap };
        }
        return best;
      };

      const addFrog = (size) => {
        const { x, y } = freeSpot();
        const f = { id: ++frogId, size, x, y, flip: Math.random() > 0.5 };
        state.frogs.push(f);
        placeFrog(f, true);
      };

      const removeFrog = (id) => {
        state.frogs = state.frogs.filter((f) => f.id !== id);
        const el = garden.querySelector(`.garden__frog[data-id="${id}"]`);
        if (!el) return;
        if (reducedMotion()) { el.remove(); return; }
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => el.remove(), { once: true });
      };

      state.frogs.forEach((f) => placeFrog(f, false));
      syncSizeSteppers();
      updateGarden();

      bindControls(root, state, (name) => {
        if (name.startsWith('size_')) {
          const size = name.slice(5);
          const current = frogs.counts(state)[size];
          if (state[name] > current) addFrog(size);
          else {
            const last = [...state.frogs].reverse().find((f) => f.size === size);
            if (last) removeFrog(last.id);
          }
          updateGarden();
        }
        onChange();
      });

      garden.addEventListener('click', (e) => {
        const btn = e.target.closest('.garden__frog');
        if (!btn || btn.classList.contains('is-leaving')) return;
        removeFrog(Number(btn.dataset.id));
        syncSizeSteppers();
        syncControls(root, state);
        updateGarden();
        onChange();
      });

      syncControls(root, state);
    },

    validate: (state) => (state.frogs.length ? '' : 'Lägg till minst en groda.'),

    price(state) {
      const c = frogs.counts(state);
      const lines = [];
      if (c.liten) lines.push({ label: `Små grodor × ${c.liten}`, key: 'bulle', n: c.liten });
      if (c.mellan) lines.push({ label: `Mellanstora grodor × ${c.mellan}`, key: 'bulle', n: c.mellan * 2 });
      if (c.stor) lines.push({ label: `Stora grodor × ${c.stor}`, key: 'kladdkaka', n: c.stor });
      if (c.jatte) lines.push({ label: `Jättegrodor × ${c.jatte}`, key: 'middag', n: c.jatte });
      if (!lines.length) return lines;
      if (state.urgency === 'idag') lines.push({ label: 'Leverans samma dag', key: 'kaffe', n: 1 });
      if (state.urgency === 'nu') lines.push({ label: 'Utryckning, NU!!!', key: 'tarta', n: 1 });
      if (state.destination === 'granne') lines.push({ label: 'Tystnadstillägg', key: 'kaffe', n: 1 });
      if (state.guarantee) lines.push({ label: 'Grodfri-garanti', key: 'kladdkaka', n: 1 });
      return lines;
    },

    summary(state) {
      const c = frogs.counts(state);
      const parts = FROG_SIZES.filter((s) => c[s.value]).map((s) => `${c[s.value]} ${c[s.value] === 1 ? s.one : s.many}`);
      const out = [parts.join(', '), `Brådska: ${labelOf(FROG_URGENCY, state.urgency)}`, `Flyttas till: ${labelOf(FROG_DEST, state.destination)}`];
      if (state.guarantee) out.push('Med grodfri-garanti');
      return out;
    },
  };

  // =====================================================================
  // 2. Räckviddshjälp
  // =====================================================================
  const REACH_LEVELS = [
    { value: 'tak', label: 'Taket', sub: 'Lampor och brandvarnare', deco: '💡' },
    { value: 'ovanpa', label: 'Ovanpå skåpen', sub: 'Där dammet bor', deco: '📦' },
    { value: 'overst', label: 'Översta hyllan', sub: 'Där allt bra står', deco: '' },
    { value: 'mitten', label: 'Mellanhyllan', sub: 'Den når du egentligen. Men visst.', deco: '' },
  ];
  const REACH_ITEMS = [
    { value: 'burk', label: 'Burk', emoji: '🫙' },
    { value: 'skal', label: 'Skål eller fat', emoji: '🥣' },
    { value: 'lampa', label: 'Glödlampa', emoji: '💡' },
    { value: 'lada', label: 'Låda', emoji: '📦' },
    { value: 'spindel', label: 'Spindel (ska bort)', emoji: '🕷️' },
    { value: 'annat', label: 'Något annat', emoji: '✨' },
  ];
  const REACH_DIR = [
    { value: 'ner', label: 'Ta ner' },
    { value: 'upp', label: 'Ställa upp' },
    { value: 'bada', label: 'Båda' },
  ];

  const reach = {
    id: 'reach',
    name: 'Räckviddshjälp',
    tagline: 'Allt som står för högt upp, hämtas ner. Eller ställs upp.',
    intro: 'Tryck på hyllan där saken står. Staplarna visar vem som når dit.',
    image: 'reach-help',
    alt: 'Illustration: Adam sträcker sig upp och tar ner en burk från översta hyllan i köket medan Helena pekar.',
    from: [{ key: 'kaffe', n: 1 }],

    initialState: () => ({ level: 'overst', item: 'burk', count: 1, direction: 'ner', note: '' }),

    render(root, state, onChange) {
      root.innerHTML = `
        ${field('Var står det?', `
          <div class="reach">
            <div class="reach__bar reach__bar--toe" title="Adam når hit på tå"><span>På tå</span></div>
            <div class="reach__bar reach__bar--adam" title="Adam når hit"><span>Adam når</span></div>
            <div class="reach__bar reach__bar--helena" title="Helena når hit"><span>Helena</span></div>
            <div class="reach__cabinet" data-group="level" data-multi="false">
              ${REACH_LEVELS.map((l) => `
                <button type="button" class="chip reach__shelf reach__shelf--${l.value}" data-value="${l.value}" aria-pressed="false">
                  <span class="reach__text"><strong>${l.label}</strong><span>${l.sub}</span></span>
                  <span class="reach__item" aria-hidden="true"></span>
                  ${l.deco ? `<span class="reach__deco" aria-hidden="true">${l.deco}</span>` : ''}
                </button>`).join('')}
            </div>
          </div>`)}
        ${field('Vad gäller det?', chips('item', REACH_ITEMS))}
        <div class="field-row">
          ${field('Hur många saker?', stepper('count', { min: 1, max: 12, label: 'antal saker' }))}
          ${field('Upp eller ner?', chips('direction', REACH_DIR, { variant: 'segmented' }))}
        </div>
        ${field('Något Adam bör veta?', `<input class="input" type="text" data-field="note" maxlength="140" placeholder="T.ex. den blå burken längst in">`)}
      `;

      const refresh = () => {
        const item = REACH_ITEMS.find((i) => i.value === state.item);
        root.querySelectorAll('.reach__item').forEach((el) => { el.textContent = ''; });
        const sel = root.querySelector(`.reach__shelf[data-value="${state.level}"] .reach__item`);
        if (sel) {
          sel.textContent = state.count > 1 ? `${item.emoji}×${state.count}` : item.emoji;
          if (!reducedMotion()) { sel.classList.remove('is-pop'); void sel.offsetWidth; sel.classList.add('is-pop'); }
        }
      };

      bindControls(root, state, () => { refresh(); onChange(); });
      syncControls(root, state);
      refresh();
    },

    validate: () => '',

    price(state) {
      const lines = [{ label: `Hämtning, ${state.count} ${state.count === 1 ? 'sak' : 'saker'}`, key: 'kaffe', n: Math.ceil(state.count / 3) }];
      if (state.level === 'ovanpa') lines.push({ label: 'Dammtillägg', key: 'bulle', n: 1 });
      if (state.level === 'tak') lines.push({ label: 'Höjdtillägg', key: 'kladdkaka', n: 1 });
      if (state.item === 'spindel') lines.push({ label: 'Modtillägg (spindel)', key: 'bulle', n: 1 });
      return lines;
    },

    summary(state) {
      const out = [
        `Var: ${labelOf(REACH_LEVELS, state.level)}`,
        `Vad: ${state.count} × ${labelOf(REACH_ITEMS, state.item).toLowerCase()}`,
        `Riktning: ${labelOf(REACH_DIR, state.direction)}`,
      ];
      if (state.note.trim()) out.push(`Notering: ${state.note.trim()}`);
      return out;
    },
  };

  // =====================================================================
  // 3. Mattehjälp
  // =====================================================================
  const MATH_TOPICS = [
    { value: 'algebra', label: 'Algebra' },
    { value: 'ekvationer', label: 'Ekvationer' },
    { value: 'funktioner', label: 'Funktioner' },
    { value: 'derivator', label: 'Derivator' },
    { value: 'integraler', label: 'Integraler' },
    { value: 'trigonometri', label: 'Trigonometri' },
    { value: 'sannolikhet', label: 'Sannolikhet' },
    { value: 'statistik', label: 'Statistik' },
    { value: 'geometri', label: 'Geometri' },
    { value: 'linalg', label: 'Linjär algebra' },
    { value: 'allt', label: 'Allt. Bara allt.' },
  ];
  const PANIC = [
    { face: '😌', label: 'Nyfiken', desc: 'Vill bara förstå lite bättre.' },
    { face: '🙂', label: 'Lite osäker', desc: 'Det går, men det känns skakigt.' },
    { face: '😬', label: 'Fastnat', desc: 'Har stirrat på samma uppgift i en timme.' },
    { face: '😰', label: 'Stressad', desc: 'Inlämningen är snart. Väldigt snart.' },
    { face: '🤯', label: 'Tentan är imorgon', desc: 'Alla siffror ser ut som bokstäver.' },
  ];
  const MATH_PLACE = [
    { value: 'helena', label: 'Hemma hos dig' },
    { value: 'adam', label: 'Hemma hos Adam' },
    { value: 'video', label: 'Videosamtal' },
  ];

  const math = {
    id: 'math',
    name: 'Mattehjälp',
    tagline: 'Derivator, ekvationer och allmän matteångest.',
    intro: 'Välj vad som krånglar och hur det känns. Priset är en fika per timme, med tillägg för panik.',
    image: 'math-help',
    alt: 'Illustration: Adam förklarar en matteuppgift för Helena vid ett skrivbord fullt av anteckningar.',
    from: [{ key: 'kaffe', n: 1 }, { key: 'bulle', n: 1 }],

    initialState: () => ({ topics: [], panic: 3, hours: 1, place: 'helena', question: '' }),

    render(root, state, onChange) {
      root.innerHTML = `
        ${field('Vad krånglar?', chips('topics', MATH_TOPICS, { multi: true }), 'Välj så många du vill.')}
        ${field('Panikmätare', `
          <div class="panic">
            <span class="panic__face" aria-hidden="true"></span>
            <div class="panic__text">
              <p class="panic__label"></p>
              <p class="panic__desc"></p>
            </div>
            <input class="range panic__range" type="range" min="1" max="5" step="1" data-field="panic" aria-label="Paniknivå, 1 till 5">
            <div class="panic__scale" aria-hidden="true"><span>Lugn</span><span>Total kris</span></div>
          </div>`)}
        <div class="field-row">
          ${field('Hur länge?', `
            <div class="hours">
              ${stepper('hours', { min: 1, max: 5, label: 'antal timmar' })}
              <span class="hours__label"></span>
            </div>
            <div class="hours__cups" aria-hidden="true"></div>`)}
          ${field('Var?', chips('place', MATH_PLACE))}
        </div>
        ${field('Uppgiften', `<textarea class="input" rows="3" data-field="question" maxlength="400" placeholder="Klistra in eller beskriv uppgiften (valfritt)"></textarea>`)}
      `;

      const refresh = (changed) => {
        const p = PANIC[state.panic - 1];
        const face = root.querySelector('.panic__face');
        face.textContent = p.face;
        root.querySelector('.panic__label').textContent = `${state.panic}/5: ${p.label}`;
        root.querySelector('.panic__desc').textContent = p.desc;
        root.querySelector('.panic').style.setProperty('--panic', (state.panic - 1) / 4);
        if (changed === 'panic' && !reducedMotion()) { face.classList.remove('is-pop'); void face.offsetWidth; face.classList.add('is-pop'); }
        root.querySelector('.hours__label').textContent = state.hours === 1 ? 'timme' : 'timmar';
        root.querySelector('.hours__cups').innerHTML = Array.from({ length: state.hours }, () => `<span>${icon('kaffe')}${icon('bulle')}</span>`).join('');
      };

      bindControls(root, state, (name) => { refresh(name); onChange(); });
      syncControls(root, state);
      refresh();
    },

    validate: (state) => (state.topics.length ? '' : 'Välj minst ett område.'),

    price(state) {
      const h = state.hours;
      const lines = [
        { label: `Fika per timme × ${h}`, key: 'kaffe', n: h },
        { label: `Hjärnbränsle × ${h}`, key: 'bulle', n: h },
      ];
      if (state.panic === 4) lines.push({ label: 'Stresstillägg', key: 'kladdkaka', n: 1 });
      if (state.panic === 5) lines.push({ label: 'Akuttillägg inför tenta', key: 'tarta', n: 1 });
      if (state.topics.includes('allt')) lines.push({ label: 'Allt-tillägg', key: 'bulle', n: 1 });
      return lines;
    },

    summary(state) {
      const out = [
        `Områden: ${state.topics.map((t) => labelOf(MATH_TOPICS, t)).join(', ')}`,
        `Panik: ${state.panic}/5 (${PANIC[state.panic - 1].label})`,
        `${state.hours} ${state.hours === 1 ? 'timme' : 'timmar'}, ${labelOf(MATH_PLACE, state.place).toLowerCase()}`,
      ];
      if (state.question.trim()) out.push(`Uppgift: ${state.question.trim()}`);
      return out;
    },
  };

  // =====================================================================
  // 4. Filmkväll
  // =====================================================================
  const GENRES = [
    { value: 'komedi', label: 'Komedi', emoji: '😂', color: '#F2D27A' },
    { value: 'romantik', label: 'Romantik', emoji: '💘', color: '#F6CBD5' },
    { value: 'deckare', label: 'Deckare', emoji: '🔎', color: '#C9D3E6' },
    { value: 'skrack', label: 'Skräck', emoji: '👻', color: '#2E4A33', dark: true },
    { value: 'action', label: 'Action', emoji: '💥', color: '#E8899F' },
    { value: 'animerat', label: 'Animerat', emoji: '🦁', color: '#BFDDF0' },
    { value: 'dokumentar', label: 'Dokumentär', emoji: '🐧', color: '#CFE3A6' },
    { value: 'adam', label: 'Adam väljer', emoji: '🎲', color: '#FFFFFF' },
  ];
  const FILMS = [
    { value: '1', label: 'En film' },
    { value: '2', label: 'Dubbelfilm' },
    { value: '3', label: 'Maraton' },
  ];
  const SNACKS = [
    { value: 'popcorn', label: 'Popcorn', emoji: '🍿' },
    { value: 'chips', label: 'Chips', emoji: '🥔' },
    { value: 'godis', label: 'Lösgodis', emoji: '🍬' },
    { value: 'choklad', label: 'Choklad', emoji: '🍫' },
    { value: 'pizza', label: 'Pizza', emoji: '🍕' },
    { value: 'glass', label: 'Glass', emoji: '🍦' },
    { value: 'lask', label: 'Läsk', emoji: '🥤' },
    { value: 'te', label: 'Te', emoji: '🍵' },
  ];
  const WHEN = [
    { value: 'ikvall', label: 'Ikväll' },
    { value: 'imorgon', label: 'Imorgon' },
    { value: 'fredag', label: 'Fredag' },
    { value: 'lordag', label: 'Lördag' },
    { value: 'annan', label: 'Annan dag' },
  ];
  const TIMES = [
    { value: '18:00', label: '18' },
    { value: '19:00', label: '19' },
    { value: '20:00', label: '20' },
    { value: '21:00', label: '21' },
  ];

  const movie = {
    id: 'movie',
    name: 'Filmkväll hos Adam',
    tagline: 'Bra tv, mjuk soffa. Hundpussar ingår.',
    intro: 'Välj genre, snacks och kväll. Betalningen är en påse godis per film, som du tar med.',
    image: 'movie-night',
    alt: 'Illustration: Helena skrattar i soffan medan hennes hund pussar Adam i ansiktet under en filmkväll.',
    from: [{ key: 'godis', n: 1 }],

    initialState: () => ({ genre: 'komedi', films: '1', snacks: ['popcorn'], when: 'fredag', date: '', time: '19:00', dog: true }),

    render(root, state, onChange) {
      root.innerHTML = `
        ${field('Vad ska vi se?', `
          <div class="posters" data-group="genre" data-multi="false">
            ${GENRES.map((g) => `
              <button type="button" class="chip poster${g.dark ? ' poster--dark' : ''}" data-value="${g.value}" aria-pressed="false" style="--poster:${g.color}">
                <span class="poster__emoji" aria-hidden="true">${g.emoji}</span>
                <span class="poster__name">${g.label}</span>
                <span class="poster__check" aria-hidden="true">${icon('check')}</span>
              </button>`).join('')}
          </div>`)}
        ${field('Hur många filmer?', chips('films', FILMS, { variant: 'segmented' }))}
        ${field('Snacks på soffbordet', chips('snacks', SNACKS, { multi: true }), 'Adam ser till att det finns hemma.')}
        ${field('När?', `
          ${chips('when', WHEN)}
          <input class="input when__date" type="date" data-field="date" aria-label="Välj datum" hidden>
          <div class="when__time">
            <span>Klockan</span>
            ${chips('time', TIMES, { variant: 'segmented' })}
          </div>`)}
        <label class="toggle toggle--locked">
          <input type="checkbox" checked disabled>
          <span class="toggle__track" aria-hidden="true"></span>
          <span><strong>Hundpussar ingår.</strong> Kan inte väljas bort.</span>
        </label>
      `;

      const refresh = () => {
        const date = root.querySelector('.when__date');
        date.hidden = state.when !== 'annan';
      };

      bindControls(root, state, () => { refresh(); onChange(); });
      syncControls(root, state);
      refresh();
    },

    validate: (state) => (state.when === 'annan' && !state.date ? 'Välj ett datum för filmkvällen.' : ''),

    price(state) {
      const n = Number(state.films);
      const lines = [{ label: `Godis per film × ${n}`, key: 'godis', n }];
      if (n === 3) lines.push({ label: 'Maratonmiddag', key: 'middag', n: 1 });
      if (state.genre === 'skrack') lines.push({ label: 'Tröstbulle efter skräckfilm', key: 'bulle', n: 1 });
      return lines;
    },

    summary(state) {
      const when = state.when === 'annan' && state.date
        ? new Date(state.date + 'T12:00').toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
        : labelOf(WHEN, state.when);
      const out = [
        `Genre: ${labelOf(GENRES, state.genre)}`,
        `Antal: ${labelOf(FILMS, state.films)}`,
        `När: ${when} kl. ${state.time}`,
      ];
      if (state.snacks.length) out.push(`Snacks: ${state.snacks.map((s) => labelOf(SNACKS, s)).join(', ')}`);
      out.push('Hundpussar ingår');
      return out;
    },
  };

  window.HelpServices = {
    SERVICES: [frogs, reach, math, movie],
    CURRENCY,
    CURRENCY_ORDER,
    amount,
    totals,
    totalsText,
    esc,
  };
})();
