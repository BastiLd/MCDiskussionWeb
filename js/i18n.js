// ---------------------------------------------------------------------------
// Internationalisation (i18n).
//
// `translations` holds every user-visible string in English (en) and German
// (de). Elements opt in with:
//   data-i18n="key"                -> sets textContent
//   data-i18n-attr="attr:key;..."  -> sets attribute(s), e.g. aria-label / placeholder
//
// setLanguage() persists the choice, updates <html lang>, re-renders the DOM
// and fires a `languagechange` event so dynamic modules (games, comments) can
// re-localise too.
// ---------------------------------------------------------------------------

export const translations = {
  en: {
    // --- Generic / nav ---
    skipLink: 'Skip to main content',
    navHome: 'Home',
    navRestore: 'RestoreInventory',
    navGames: 'Games',
    navMods: 'Mods',
    langToggle: 'Switch language to German',
    langName: 'EN',

    // --- Hero ---
    heroTitle: 'BastiLd Mod Hub',
    heroSubtitle: 'Explore mods and play mini-games.',
    heroLead:
      'A small hub for my Minecraft mods. Start with RestoreInventory — never lose your inventory again — then stick around for a game.',
    heroCtaRestore: 'Explore RestoreInventory',
    heroCtaGames: 'Play a game',

    // --- RestoreInventory ---
    riTitle: 'RestoreInventory',
    riTagline:
      'A Fabric mod that automatically backs up your inventory and lets you restore it on demand — across deaths, mistakes and even mod updates.',
    featuresTitle: 'Features',
    feat1: 'Four save slots per player: Auto (short), Auto (long), Manual and Death.',
    feat2: 'Configurable auto-save intervals for the Auto slots.',
    feat3: 'Auto-save just before death into the dedicated Death slot.',
    feat4: 'Undo restoration (/restoreinv undo) — before restoring, the current inventory is saved.',
    feat5: 'Inventory preview GUI (9×6) showing armor, main inventory, hotbar and off-hand.',
    feat6: 'Detailed tooltips: relative time, item count and best tool.',
    feat7: 'Pin protection: right-click to prevent overwriting saves.',
    feat8: 'Configurable number of saves per slot (1–9).',
    feat9: 'Restore sound toggle and per-player settings.',
    feat10: 'Multilingual (English / German).',
    feat11: 'Asynchronous saving off the server thread.',
    feat12: 'Saves stored in restoreinv/<uuid> and persist across mod updates.',
    feat13: 'Supported Minecraft versions: 1.21–1.21.1, 1.21.2–1.21.4, 1.21.9–1.21.11 (three JARs cover these ranges).',
    feat14: 'Commands: /restoreinv 1|2|3|4, save, undo, saves, config, version; aliases /rinv and /restoreInv.',
    feat15: 'Permissions: restoreinv.admin and restoreinv.restore. Falls back to OP level if fabric-permissions-api is absent.',
    feat16: 'MIT license; saves survive updates and are backward-compatible.',

    // --- Downloads ---
    downloadsTitle: 'Downloads',
    thVersion: 'Version Range',
    thJar: 'JAR Name',
    thDownload: 'Download',
    btnModrinth: 'Modrinth',
    btnGithub: 'GitHub Release',
    downloadNote: 'Saves survive updates.',

    // --- Commands ---
    commandsTitle: 'Commands',
    thCommand: 'Command',
    thDescription: 'Description',
    cmd1: 'Restore from Auto-short / Auto-long / Manual / Death.',
    cmd2: 'Save current inventory to the Manual slot.',
    cmd3: 'Undo the last restoration.',
    cmd4: 'Open your save list GUI.',
    cmd5: 'Open the configuration GUI (admins only).',
    cmd6: 'Show the mod and Minecraft version.',
    cmdAliasesLabel: 'Aliases',
    cmdAliases: 'Shortcuts for /restoreinv.',

    // --- Permissions ---
    permissionsTitle: 'Permissions',
    thNode: 'Node',
    thEffect: 'Effect',
    perm1: 'Access config GUI, admin panel, restore other players.',
    perm2: 'Restore your own inventory (/restoreinv and undo).',

    // --- Comments ---
    commentsTitle: 'Comments',
    commentsIntro: 'Got feedback or a bug report? Leave a comment.',
    commentsLoading: 'Loading comments…',
    commentsEmpty: 'No comments yet — be the first!',
    commentsError: 'Comments are unavailable right now. (Has the database been set up?)',
    formName: 'Name',
    formNamePh: 'Your name',
    formBody: 'Comment',
    formBodyPh: 'Write something nice…',
    formSubmit: 'Post comment',
    formReply: 'Reply',
    formReplyTo: 'Replying to',
    formCancel: 'Cancel',
    rateLimited: 'Please wait a moment before posting again.',
    commentEmptyFields: 'Please enter both a name and a comment.',
    commentPosted: 'Thanks! Your comment was posted.',

    // --- Games ---
    gamesTitle: 'Games',
    gamesIntro: 'A quick break? Capture the field to win a round — vs CPU, 2 players, or watch a demo.',
    pongTitle: 'Paddle Force',
    pongHowto: 'P1: W A S D move · C / V rotate. P2: arrows move · , / . rotate. Capture the field to win a round.',
    pongAria: 'Paddle Force game board',
    p1Label: 'Player 1',
    p2Label: 'Player 2',
    cpuLabel: 'CPU',
    gameWinner: 'wins!',
    gameRestart: 'Restart',
    gameStartHint: 'Press Space or Restart to play.',
    ctrlUp: 'Move up',
    ctrlDown: 'Move down',
    ctrlLeft: 'Move left',
    ctrlRight: 'Move right',
    ctrlRotL: 'Rotate counter-clockwise',
    ctrlRotR: 'Rotate clockwise',
    // Paddle Force menu
    pgTitle: 'Paddle Force',
    pgMode: 'Mode',
    pgModeCpu: 'vs CPU',
    pgModePvp: '2 Players',
    pgModeDemo: 'CPU vs CPU',
    pgDifficulty: 'Difficulty',
    pgDiffEasy: 'Easy',
    pgDiffMedium: 'Medium',
    pgDiffHard: 'Hard',
    pgRounds: 'Best of',
    pgPowerups: 'Power-ups',
    pgStart: 'Start',
    pgPlayFull: '▶ Play fullscreen',
    pgResume: 'Resume',
    pgRematch: 'Rematch',
    pgMenu: 'Menu',
    pgPaused: 'Paused',
    pgHintStart: 'Pick your settings and press Start. Space/P = pause, M = mute.',
    pgBestOf: 'Best of',
    pgWin: '{p} wins the match!',
    pgCapture: '{p} captures the field!',
    pgMute: 'Mute sound',
    pgUnmute: 'Unmute sound',
    pu_grow: 'Grow',
    pu_ghost: 'Ghost',
    pu_spin: 'Spin',
    pu_bones: 'Bones',
    pu_sticky: 'Sticky',
    pu_mines: 'Mine',
    memoryTitle: 'Memory Match',
    memoryIntro: 'Bonus round — flip the cards and find every pair.',
    memoryMoves: 'Moves',
    memoryWon: 'Solved in {n} moves!',
    memoryRestart: 'New game',

    // --- Mods ---
    modsTitle: 'Mods',
    modsIntro: 'Everything I have published, plus what is coming next.',
    modsRestoreCard: 'Inventory backups & restoration for Fabric.',
    modsSoonTitle: 'More coming soon',
    modsSoon: 'New mods will appear here. Have an idea? Drop it in the comments.',
    modsView: 'View',

    // --- Admin / Dashboard ---
    navDashboard: 'Dashboard',
    adminTitle: 'Dashboard',
    adminLoginAria: 'Admin login',
    adminLoginLead: 'Sign in to manage comments and view stats.',
    adminEmail: 'Email',
    adminPassword: 'Password',
    adminSignIn: 'Sign in',
    adminSigningIn: 'Signing in…',
    adminLoginError: 'Login failed. Check your email and password.',
    adminNotAuthorized: 'This account is not an admin.',
    adminRefresh: 'Refresh',
    adminLogout: 'Log out',
    adminStatsTitle: 'Statistics',
    adminCommentsTitle: 'Comment moderation',
    adminLoading: 'Loading…',
    adminLoadError: 'Could not load data. (Is the database set up?)',
    adminNoComments: 'No comments yet.',
    statPageviews: 'Page views',
    statDownloads: 'Download clicks',
    statGameStarts: 'Game starts',
    statComments: 'Comments total',
    statVisible: 'Visible',
    statHidden: 'Hidden / deleted',
    breakdownDownloads: 'Downloads by target',
    breakdownSections: 'Views by section',
    status_visible: 'visible',
    status_hidden: 'hidden',
    status_deleted: 'deleted',
    adminReply: 'Reply',
    adminReplyPh: 'Write a reply…',
    adminReplySend: 'Send',
    adminHide: 'Hide',
    adminShow: 'Show',
    adminDelete: 'Delete',
    adminDeleteConfirm: 'Delete this comment (and its replies) permanently?',

    // --- Footer ---
    footerMade: 'Made by BastiLd · MIT licensed',
    footerSource: 'Source on GitHub',
  },

  de: {
    // --- Generic / nav ---
    skipLink: 'Zum Hauptinhalt springen',
    navHome: 'Startseite',
    navRestore: 'RestoreInventory',
    navGames: 'Spiele',
    navMods: 'Mods',
    langToggle: 'Sprache auf Englisch umstellen',
    langName: 'DE',

    // --- Hero ---
    heroTitle: 'BastiLds Mod-Hub',
    heroSubtitle: 'Entdecke Mods und spiele Mini-Spiele.',
    heroLead:
      'Ein kleiner Hub für meine Minecraft-Mods. Starte mit RestoreInventory – verliere nie wieder dein Inventar – und bleib für eine Runde Spiel.',
    heroCtaRestore: 'RestoreInventory entdecken',
    heroCtaGames: 'Spiel spielen',

    // --- RestoreInventory ---
    riTitle: 'RestoreInventory',
    riTagline:
      'Eine Fabric-Mod, die dein Inventar automatisch sichert und es auf Wunsch wiederherstellt – über Tode, Fehler und sogar Mod-Updates hinweg.',
    featuresTitle: 'Funktionen',
    feat1: 'Vier Speicher-Slots pro Spieler: Auto (kurz), Auto (lang), Manuell und Tod.',
    feat2: 'Konfigurierbare Auto-Speicher-Intervalle für die Auto-Slots.',
    feat3: 'Automatisches Speichern kurz vor dem Tod in den dedizierten Tod-Slot.',
    feat4: 'Wiederherstellung rückgängig machen (/restoreinv undo) – vor dem Wiederherstellen wird das aktuelle Inventar gesichert.',
    feat5: 'Inventar-Vorschau-GUI (9×6) mit Rüstung, Hauptinventar, Hotbar und Zweithand.',
    feat6: 'Detaillierte Tooltips: relative Zeit, Anzahl der Items und bestes Werkzeug.',
    feat7: 'Pin-Schutz: Rechtsklick verhindert das Überschreiben von Speicherständen.',
    feat8: 'Konfigurierbare Anzahl an Speicherständen pro Slot (1–9).',
    feat9: 'Umschaltbarer Wiederherstellungs-Sound und Einstellungen pro Spieler.',
    feat10: 'Mehrsprachig (Englisch / Deutsch).',
    feat11: 'Asynchrones Speichern außerhalb des Server-Threads.',
    feat12: 'Speicherstände liegen in restoreinv/<uuid> und überstehen Mod-Updates.',
    feat13: 'Unterstützte Minecraft-Versionen: 1.21–1.21.1, 1.21.2–1.21.4, 1.21.9–1.21.11 (drei JARs decken diese Bereiche ab).',
    feat14: 'Befehle: /restoreinv 1|2|3|4, save, undo, saves, config, version; Aliase /rinv und /restoreInv.',
    feat15: 'Berechtigungen: restoreinv.admin und restoreinv.restore. Fällt auf OP-Level zurück, wenn die fabric-permissions-api fehlt.',
    feat16: 'MIT-Lizenz; Speicherstände überstehen Updates und sind abwärtskompatibel.',

    // --- Downloads ---
    downloadsTitle: 'Downloads',
    thVersion: 'Versionsbereich',
    thJar: 'JAR-Name',
    thDownload: 'Download',
    btnModrinth: 'Modrinth',
    btnGithub: 'GitHub-Release',
    downloadNote: 'Saves überstehen Updates.',

    // --- Commands ---
    commandsTitle: 'Befehle',
    thCommand: 'Befehl',
    thDescription: 'Beschreibung',
    cmd1: 'Wiederherstellen aus Auto-kurz / Auto-lang / Manuell / Tod.',
    cmd2: 'Aktuelles Inventar im Manuell-Slot speichern.',
    cmd3: 'Letzte Wiederherstellung rückgängig machen.',
    cmd4: 'Eigene Save-Liste (GUI) öffnen.',
    cmd5: 'Config-GUI öffnen (nur Admins).',
    cmd6: 'Mod- und Minecraft-Version anzeigen.',
    cmdAliasesLabel: 'Aliase',
    cmdAliases: 'Kurzformen für /restoreinv.',

    // --- Permissions ---
    permissionsTitle: 'Berechtigungen',
    thNode: 'Node',
    thEffect: 'Wirkung',
    perm1: 'Zugriff auf Config-GUI, Admin-Panel, fremde Inventare wiederherstellen.',
    perm2: 'Eigenes Inventar wiederherstellen (/restoreinv und undo).',

    // --- Comments ---
    commentsTitle: 'Kommentare',
    commentsIntro: 'Feedback oder einen Bug gefunden? Hinterlasse einen Kommentar.',
    commentsLoading: 'Kommentare werden geladen…',
    commentsEmpty: 'Noch keine Kommentare – sei der oder die Erste!',
    commentsError: 'Kommentare sind gerade nicht verfügbar. (Wurde die Datenbank eingerichtet?)',
    formName: 'Name',
    formNamePh: 'Dein Name',
    formBody: 'Kommentar',
    formBodyPh: 'Schreib etwas Nettes…',
    formSubmit: 'Kommentar posten',
    formReply: 'Antworten',
    formReplyTo: 'Antwort an',
    formCancel: 'Abbrechen',
    rateLimited: 'Bitte warte einen Moment, bevor du erneut postest.',
    commentEmptyFields: 'Bitte gib einen Namen und einen Kommentar ein.',
    commentPosted: 'Danke! Dein Kommentar wurde gepostet.',

    // --- Games ---
    gamesTitle: 'Spiele',
    gamesIntro: 'Kurze Pause? Erobere das Feld, um eine Runde zu gewinnen — gegen CPU, zu zweit oder als Demo.',
    pongTitle: 'Paddle Force',
    pongHowto: 'S1: W A S D bewegen · C / V drehen. S2: Pfeile bewegen · , / . drehen. Feld erobern = Runde gewinnen.',
    pongAria: 'Paddle-Force-Spielfeld',
    p1Label: 'Spieler 1',
    p2Label: 'Spieler 2',
    cpuLabel: 'CPU',
    gameWinner: 'gewinnt!',
    gameRestart: 'Neustart',
    gameStartHint: 'Drücke Leertaste oder Neustart zum Spielen.',
    ctrlUp: 'Nach oben bewegen',
    ctrlDown: 'Nach unten bewegen',
    ctrlLeft: 'Nach links bewegen',
    ctrlRight: 'Nach rechts bewegen',
    ctrlRotL: 'Gegen den Uhrzeigersinn drehen',
    ctrlRotR: 'Im Uhrzeigersinn drehen',
    // Paddle Force Menü
    pgTitle: 'Paddle Force',
    pgMode: 'Modus',
    pgModeCpu: 'gegen CPU',
    pgModePvp: '2 Spieler',
    pgModeDemo: 'CPU gegen CPU',
    pgDifficulty: 'Schwierigkeit',
    pgDiffEasy: 'Leicht',
    pgDiffMedium: 'Mittel',
    pgDiffHard: 'Schwer',
    pgRounds: 'Best of',
    pgPowerups: 'Power-ups',
    pgStart: 'Start',
    pgPlayFull: '▶ Vollbild spielen',
    pgResume: 'Weiter',
    pgRematch: 'Nochmal',
    pgMenu: 'Menü',
    pgPaused: 'Pausiert',
    pgHintStart: 'Einstellungen wählen und Start drücken. Leertaste/P = Pause, M = Ton.',
    pgBestOf: 'Best of',
    pgWin: '{p} gewinnt das Match!',
    pgCapture: '{p} erobert das Feld!',
    pgMute: 'Ton aus',
    pgUnmute: 'Ton an',
    pu_grow: 'Grow',
    pu_ghost: 'Ghost',
    pu_spin: 'Spin',
    pu_bones: 'Bones',
    pu_sticky: 'Sticky',
    pu_mines: 'Mine',
    memoryTitle: 'Memory',
    memoryIntro: 'Bonusrunde – dreh die Karten um und finde alle Paare.',
    memoryMoves: 'Züge',
    memoryWon: 'Gelöst in {n} Zügen!',
    memoryRestart: 'Neues Spiel',

    // --- Mods ---
    modsTitle: 'Mods',
    modsIntro: 'Alles, was ich veröffentlicht habe, und was als Nächstes kommt.',
    modsRestoreCard: 'Inventar-Backups & Wiederherstellung für Fabric.',
    modsSoonTitle: 'Bald mehr',
    modsSoon: 'Neue Mods erscheinen hier. Eine Idee? Schreib sie in die Kommentare.',
    modsView: 'Ansehen',

    // --- Admin / Dashboard ---
    navDashboard: 'Dashboard',
    adminTitle: 'Dashboard',
    adminLoginAria: 'Admin-Login',
    adminLoginLead: 'Melde dich an, um Kommentare zu verwalten und Statistiken zu sehen.',
    adminEmail: 'E-Mail',
    adminPassword: 'Passwort',
    adminSignIn: 'Anmelden',
    adminSigningIn: 'Anmeldung läuft…',
    adminLoginError: 'Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.',
    adminNotAuthorized: 'Dieses Konto ist kein Admin.',
    adminRefresh: 'Aktualisieren',
    adminLogout: 'Abmelden',
    adminStatsTitle: 'Statistiken',
    adminCommentsTitle: 'Kommentar-Moderation',
    adminLoading: 'Lädt…',
    adminLoadError: 'Daten konnten nicht geladen werden. (Ist die Datenbank eingerichtet?)',
    adminNoComments: 'Noch keine Kommentare.',
    statPageviews: 'Seitenaufrufe',
    statDownloads: 'Download-Klicks',
    statGameStarts: 'Spielstarts',
    statComments: 'Kommentare gesamt',
    statVisible: 'Sichtbar',
    statHidden: 'Versteckt / gelöscht',
    breakdownDownloads: 'Downloads nach Ziel',
    breakdownSections: 'Aufrufe nach Bereich',
    status_visible: 'sichtbar',
    status_hidden: 'versteckt',
    status_deleted: 'gelöscht',
    adminReply: 'Antworten',
    adminReplyPh: 'Antwort schreiben…',
    adminReplySend: 'Senden',
    adminHide: 'Verstecken',
    adminShow: 'Anzeigen',
    adminDelete: 'Löschen',
    adminDeleteConfirm: 'Diesen Kommentar (und seine Antworten) endgültig löschen?',

    // --- Footer ---
    footerMade: 'Erstellt von BastiLd · MIT-Lizenz',
    footerSource: 'Quellcode auf GitHub',
  },
};

let current = 'en';

export function getLanguage() {
  return current;
}

/** Translate a key for the current language, falling back to EN then the key. */
export function t(key) {
  const langTable = translations[current] || translations.en;
  if (key in langTable) return langTable[key];
  if (key in translations.en) return translations.en[key];
  return key;
}

/** Pick the initial language from localStorage, then the browser preference. */
export function detectLanguage() {
  let saved = null;
  try {
    saved = localStorage.getItem('lang');
  } catch {
    /* storage may be blocked */
  }
  if (saved && translations[saved]) return saved;
  return (navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en';
}

/** Update every translatable element inside `root` for the current language. */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.getAttribute('data-i18n-attr')
      .split(';')
      .forEach((pair) => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      });
  });
}

/** Set the active language, persist it, re-render and notify listeners. */
export function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  current = lang;
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang;
  applyTranslations();
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}
