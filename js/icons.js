// Handritade SVG-ikoner. Bläckfärgen matchar konturerna i illustrationerna.
(function () {
  const INK = '#1E3324';
  const s = (w = 2.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  const ICONS = {
    hoodie: `<svg viewBox="0 0 64 64">
      <path d="M21 22 C20 9 44 9 43 22 C39 27 25 27 21 22 Z" fill="#3E6045" ${s(2.5)}/>
      <path d="M20 20 C14 22 10 26 9 32 L6 52 L14 53 L17 37 L17 58 L47 58 L47 37 L50 53 L58 52 L55 32 C54 26 50 22 44 20 C40 26 24 26 20 20 Z" fill="#2E4A33" ${s(2.5)}/>
      <path d="M25 21 C26 15 38 15 39 21 C36 23.5 28 23.5 25 21 Z" fill="${INK}"/>
      <path d="M29 26 L28 35 M35 26 L36 35" stroke="#F3F6E8" stroke-width="2" stroke-linecap="round"/>
      <path d="M23 44 H41 L44 52 H20 Z" fill="none" ${s(2)}/>
    </svg>`,

    basket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 10h18l-2 10H5z"/><path d="M8 10l3-6M16 10l-3-6M9 14v3M15 14v3"/>
    </svg>`,

    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,

    // Betalmedel
    bulle: `<svg viewBox="0 0 48 48">
      <circle cx="24" cy="25" r="18" fill="#D69A5B" ${s()}/>
      <path d="M24 25 A2 2 0 0 1 28 25 A4 4 0 0 1 20 25 A6 6 0 0 1 32 25 A8 8 0 0 1 16 25 A10 10 0 0 1 36 25" fill="none" stroke="#8A5328" stroke-width="2.5" stroke-linecap="round"/>
      <g fill="#fff" stroke="${INK}" stroke-width="1"><rect x="13" y="15" width="3.5" height="3.5" rx="1"/><rect x="31" y="12" width="3.5" height="3.5" rx="1"/><rect x="34" y="31" width="3.5" height="3.5" rx="1"/><rect x="15" y="33" width="3.5" height="3.5" rx="1"/><rect x="23" y="11" width="3" height="3" rx="1"/></g>
    </svg>`,

    kaffe: `<svg viewBox="0 0 48 48">
      <path d="M18 15 C16 12 20 10 18 6 M26 15 C24 12 28 10 26 6" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      <ellipse cx="23" cy="40" rx="18" ry="4" fill="#fff" ${s()}/>
      <path d="M36 23 H38 A5 5 0 0 1 38 33 H34.5" fill="none" ${s()}/>
      <path d="M10 19 H36 V28 A10 10 0 0 1 26 38 H20 A10 10 0 0 1 10 28 Z" fill="#fff" ${s()}/>
      <path d="M11.3 20.3 H34.7 V23.5 H11.3 Z" fill="#7A4A22"/>
    </svg>`,

    kladdkaka: `<svg viewBox="0 0 48 48">
      <path d="M6 25 L12 30 L12 40 L6 35 Z" fill="#3B1F13" ${s()}/>
      <path d="M12 30 L44 21 L44 31 L12 40 Z" fill="#4E2A1A" ${s()}/>
      <path d="M6 25 L37 14 L44 21 L12 30 Z" fill="#6B3A24" ${s()}/>
      <g fill="#fff"><circle cx="16" cy="25" r="1.1"/><circle cx="22" cy="22" r="1.1"/><circle cx="27" cy="24" r="1.1"/><circle cx="20" cy="27" r="1"/><circle cx="33" cy="20" r="1"/></g>
      <path d="M28 16 C26 11 31 9 33 11 C35 8 40 10 38 14 C40 16 37 19 34 18 C32 20 28 19 28 16 Z" fill="#fff" ${s(2)}/>
    </svg>`,

    tarta: `<svg viewBox="0 0 48 48">
      <ellipse cx="24" cy="40" rx="21" ry="4" fill="#fff" ${s()}/>
      <path d="M6 39 V29 C6 14 42 14 42 29 V39 Z" fill="#B9D88A" ${s()}/>
      <path d="M12 26 C14 23 17 22 19 22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="M17 17 C13 15 11 18 11 18 C14 20 16 19 17 17 Z" fill="#6F9A3E" ${s(1.5)}/>
      <circle cx="24" cy="15" r="6" fill="#E8899F" ${s(2)}/>
      <path d="M24 15 a1.5 1.5 0 0 1 3 0 a3 3 0 0 1 -6 0" fill="none" stroke="#B8324F" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    middag: `<svg viewBox="0 0 48 48">
      <circle cx="24" cy="25" r="19" fill="#fff" ${s()}/>
      <circle cx="24" cy="25" r="12.5" fill="#F3F1E6" stroke="${INK}" stroke-width="1.2"/>
      <ellipse cx="16.5" cy="29" rx="4" ry="2.8" fill="#F2D27A" ${s(1.4)}/>
      <g fill="#8A5328" stroke="${INK}" stroke-width="1.4"><circle cx="21" cy="22" r="4"/><circle cx="28.5" cy="21.5" r="4"/><circle cx="25" cy="28.5" r="4"/></g>
      <g fill="#C2405F"><circle cx="31" cy="29" r="1.8"/><circle cx="33" cy="26.5" r="1.6"/><circle cx="30.5" cy="32" r="1.5"/></g>
    </svg>`,

    godis: `<svg viewBox="0 0 48 48">
      <circle cx="18" cy="13" r="4.5" fill="#E8899F" ${s(2)}/>
      <circle cx="31" cy="13" r="4.5" fill="#B9D88A" ${s(2)}/>
      <rect x="21" y="7" width="7" height="7" rx="2" fill="#F2D27A" ${s(2)}/>
      <path d="M10 17 H38 L35 42 H13 Z" fill="#fff" ${s()}/>
      <path d="M17 18 L18 41 M24 18 V41 M31 18 L30 41" stroke="#E8899F" stroke-width="2.5"/>
      <path d="M10 17 H38 L35 42 H13 Z" fill="none" ${s()}/>
    </svg>`,

    frog: `<svg viewBox="0 0 100 84">
      <ellipse cx="22" cy="74" rx="15" ry="6" fill="#6FA23E" ${s(3)}/>
      <ellipse cx="78" cy="74" rx="15" ry="6" fill="#6FA23E" ${s(3)}/>
      <circle cx="29" cy="28" r="15" fill="#7FB34A" ${s(3.5)}/>
      <circle cx="71" cy="28" r="15" fill="#7FB34A" ${s(3.5)}/>
      <ellipse cx="50" cy="54" rx="40" ry="26" fill="#7FB34A" ${s(3.5)}/>
      <ellipse cx="50" cy="62" rx="22" ry="13" fill="#CFE3A6"/>
      <circle cx="29" cy="27" r="9" fill="#fff"/>
      <circle cx="71" cy="27" r="9" fill="#fff"/>
      <circle class="frog__pupil" cx="31" cy="28" r="4.5" fill="${INK}"/>
      <circle class="frog__pupil" cx="69" cy="28" r="4.5" fill="${INK}"/>
      <path d="M36 49 Q50 58 64 49" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="25" cy="47" r="4.5" fill="#E8899F" opacity=".75"/>
      <circle cx="75" cy="47" r="4.5" fill="#E8899F" opacity=".75"/>
    </svg>`,
  };

  function icon(name, cls = '') {
    const svg = ICONS[name];
    if (!svg) return '';
    return svg.replace('<svg ', `<svg class="icon ${cls}" aria-hidden="true" focusable="false" `);
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.dataset.iconDone) return;
      el.innerHTML = icon(el.dataset.icon);
      el.dataset.iconDone = '1';
    });
  }

  window.Icons = { icon, hydrateIcons };
})();
