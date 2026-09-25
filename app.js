(() => {
  let initialized = false;
  let activeFilter = 'all';

  const STORAGE = {
    theme: 'devkit-theme',
    sidebar: 'devkit-sidebar-collapsed',
    order: 'devkit-tool-order-v1',
    favorites: 'devkit-tool-favorites-v1',
    sidebarOrder: 'devkit-sidebar-tool-order-v1',
    sidebarMenuOrder: 'devkit-sidebar-menu-order-v1',
    language: 'devkit-language'
  };

  const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;

  const readStorage = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  };

  const readJson = (key, fallback) => {
    try {
      const raw = readStorage(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  };

  function initApp() {
    if (initialized) return;

    const appShell = document.getElementById('appShell');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarClose = document.getElementById('mobileSidebarClose');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const themeToggle = document.getElementById('themeToggle');
    const globalSearch = document.getElementById('globalSearch');
    const mobileSearch = document.getElementById('mobileSearch');

    // Shared layout is injected asynchronously. Wait until it exists.
    if (!appShell || !sidebarToggle || !themeToggle || !globalSearch) return;
    initialized = true;

    const toolsGrid = document.getElementById('toolsGrid');
    const cards = [...document.querySelectorAll('.tool-card')];
    const filterButtons = [...document.querySelectorAll('.filter-chip')];
    const emptyState = document.getElementById('emptyState');
    const dashboardAd = toolsGrid?.querySelector('.dashboard-ad-cell') || null;

    // Remove anything left behind by a cancelled/older drag implementation.
    document.querySelectorAll('.tool-drop-placeholder, .sidebar-drop-placeholder, .sidebar-drag-ghost')
      .forEach(node => node.remove());

    let preferenceToastTimer;
    let preferenceToast = document.getElementById('preferenceToast');
    if (!preferenceToast) {
      preferenceToast = document.createElement('div');
      preferenceToast.id = 'preferenceToast';
      preferenceToast.className = 'preference-toast';
      preferenceToast.setAttribute('role', 'status');
      preferenceToast.setAttribute('aria-live', 'polite');
      document.body.appendChild(preferenceToast);
    }

    function showPreferenceToast(message) {
      preferenceToast.textContent = message;
      preferenceToast.classList.add('show');
      clearTimeout(preferenceToastTimer);
      preferenceToastTimer = window.setTimeout(() => preferenceToast.classList.remove('show'), 1400);
    }

    function setTheme(theme) {
      document.documentElement.setAttribute('data-bs-theme', theme);
      writeStorage(STORAGE.theme, theme);
      themeToggle.innerHTML = theme === 'dark'
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon-stars"></i>';
    }

    setTheme(readStorage(STORAGE.theme, 'light'));

    // ---------- Language selection / UI translation ----------
    const I18N = {
      en: {
        searchDeveloperTools: 'Search developer tools', searchTools: 'Search tools...',
        development: 'Development', converter: 'Converter', web: 'Web',
        gitCheatsheet: 'Git cheatsheet', randomPortGenerator: 'Random port generator', crontabGenerator: 'Crontab generator',
        jsonPrettifyFormat: 'JSON prettify & format', jsonMinify: 'JSON minify', jsonToCsv: 'JSON to CSV',
        sqlPrettifyFormat: 'SQL prettify & format', chmodCalculator: 'Chmod calculator', dockerRunConverter: 'Docker run converter', xmlFormatter: 'XML formatter',
        unitConverter: 'Unit converter', timestampConverter: 'Timestamp converter', colorConverter: 'Color converter', urlParser: 'URL parser', httpStatusExplorer: 'HTTP status explorer',
        developerUtilities: 'Developer utilities', allTools: 'All tools', privacy: 'Privacy', feedback: 'Feedback',
        footerTagline: 'DevKit Studio — fast, browser-first developer utilities.',
        developerToolbox: 'Developer toolbox', dashboardDescription: 'Fast utilities for coding, security, data and web workflows.',
        all: 'All', generate: 'Generate', security: 'Security', format: 'Format', openTool: 'Open tool',
        noToolsFound: 'No tools found', noToolsFoundHint: 'Try a different keyword or reset the category filter.',
        tokenGenerator: 'Token generator', tokenGeneratorDesc: 'Create secure random strings with custom length, character sets and presets.',
        hashText: 'Hash text', hashTextDesc: 'Hash text using MD5, SHA-1, SHA-256 and SHA-512 in one clean interface.',
        bcrypt: 'Bcrypt', bcryptDesc: 'Generate and compare password hashes with adjustable cost settings.',
        uuidGenerator: 'UUID generator', uuidGeneratorDesc: 'Create standards-compliant UUIDs instantly, including batch generation.',
        ulidGenerator: 'ULID generator', ulidGeneratorDesc: 'Generate lexicographically sortable identifiers for modern distributed systems.',
        encryptDecrypt: 'Encrypt / decrypt', encryptDecryptDesc: 'Encode and decode text with clear settings and copy-ready results.',
        bip39Passphrase: 'BIP39 passphrase', bip39PassphraseDesc: 'Generate BIP39-compatible mnemonic phrases with entropy options.',
        hmacGenerator: 'HMAC generator', hmacGeneratorDesc: 'Compute hash-based message authentication codes from text and secret keys.',
        jsonFormatter: 'JSON formatter', jsonFormatterDesc: 'Beautify, validate and minify JSON with readable error feedback.',
        sqlFormatter: 'SQL formatter', sqlFormatterDesc: 'Prettify SQL queries with indentation, keyword casing and compact output.',
        xmlFormatterTitle: 'XML formatter', xmlFormatterDesc: 'Beautify or compact XML while preserving structure and readability.',
        chmodCalculatorDesc: 'Translate Unix permissions between symbolic and numeric notation.',
        chmodUtility: 'Linux / Unix utility', chmodIntroHtml: 'Build Linux file permissions visually and instantly convert them into numeric, symbolic and ready-to-run <strong>chmod</strong> commands. Everything runs locally in your browser.',
        resetTo755: 'Reset to 755', permissionMatrix: 'Permission matrix', permissionWeights: 'Read 4 · Write 2 · Execute 1',
        permission: 'Permission', owner: 'Owner (u)', group: 'Group (g)', public: 'Public (o)', read: 'Read', write: 'Write', execute: 'Execute',
        fileDirectoryPath: 'File or directory path', copyChmod: 'Copy chmod', numeric: 'Numeric', symbolic: 'Symbolic', chmodCommand: 'chmod command', symbolicCommand: 'symbolic command', copy: 'Copy', commonPresets: 'Common presets',
        presetScripts: '755 · Scripts', presetFiles: '644 · Files', presetPrivate: '700 · Private', presetShared: '775 · Shared', presetSecrets: '600 · Secrets',
        readValue: 'Read = 4', writeValue: 'Write = 2', executeValue: 'Execute = 1',
        readHelp: 'Allows viewing file contents or listing directory contents.', writeHelp: 'Allows editing files or creating and removing items in a directory.', executeHelp: 'Allows running a file or entering and traversing a directory.',
        developmentJson: 'Development / JSON', jsonPageTitle: 'JSON prettify & format', jsonPageIntro: 'Paste JSON below to validate and format it. Shared navigation, advertising regions and footer are imported separately.',
        jsonInput: 'JSON input', formatJson: 'Format JSON', minify: 'Minify', clear: 'Clear',
        scrollTop: 'Scroll to top', scrollBottom: 'Scroll to bottom', chooseLanguage: 'Choose language', toggleSidebar: 'Toggle sidebar', closeSidebar: 'Close sidebar'
      },
      de: {
        searchDeveloperTools: 'Entwicklertools durchsuchen', searchTools: 'Tools durchsuchen...',
        development: 'Entwicklung', converter: 'Konverter', web: 'Web',
        gitCheatsheet: 'Git-Spickzettel', randomPortGenerator: 'Zufälliger Port-Generator', crontabGenerator: 'Crontab-Generator',
        jsonPrettifyFormat: 'JSON formatieren', jsonMinify: 'JSON minimieren', jsonToCsv: 'JSON zu CSV',
        sqlPrettifyFormat: 'SQL formatieren', chmodCalculator: 'Chmod-Rechner', dockerRunConverter: 'Docker-Run-Konverter', xmlFormatter: 'XML-Formatierer',
        unitConverter: 'Einheiten-Konverter', timestampConverter: 'Zeitstempel-Konverter', colorConverter: 'Farb-Konverter', urlParser: 'URL-Parser', httpStatusExplorer: 'HTTP-Status-Explorer',
        developerUtilities: 'Entwicklerwerkzeuge', allTools: 'Alle Tools', privacy: 'Datenschutz', feedback: 'Feedback',
        footerTagline: 'DevKit Studio — schnelle, browserbasierte Entwicklerwerkzeuge.',
        developerToolbox: 'Entwickler-Werkzeugkasten', dashboardDescription: 'Schnelle Tools für Code, Sicherheit, Daten und Web-Workflows.',
        all: 'Alle', generate: 'Generatoren', security: 'Sicherheit', format: 'Formatierung', openTool: 'Tool öffnen',
        noToolsFound: 'Keine Tools gefunden', noToolsFoundHint: 'Versuche einen anderen Suchbegriff oder setze den Kategorienfilter zurück.',
        tokenGenerator: 'Token-Generator', tokenGeneratorDesc: 'Erstelle sichere Zufallszeichenfolgen mit eigener Länge, Zeichensätzen und Vorgaben.',
        hashText: 'Text hashen', hashTextDesc: 'Hashwerte mit MD5, SHA-1, SHA-256 und SHA-512 in einer übersichtlichen Oberfläche erzeugen.',
        bcrypt: 'Bcrypt', bcryptDesc: 'Passwort-Hashes mit einstellbaren Kosten erzeugen und vergleichen.',
        uuidGenerator: 'UUID-Generator', uuidGeneratorDesc: 'Standardkonforme UUIDs sofort erstellen, auch als Stapel.',
        ulidGenerator: 'ULID-Generator', ulidGeneratorDesc: 'Lexikografisch sortierbare Kennungen für moderne verteilte Systeme erzeugen.',
        encryptDecrypt: 'Ver- / Entschlüsseln', encryptDecryptDesc: 'Text mit klaren Einstellungen ver- und entschlüsseln und Ergebnisse direkt kopieren.',
        bip39Passphrase: 'BIP39-Passphrase', bip39PassphraseDesc: 'BIP39-kompatible Mnemonics mit Entropieoptionen erzeugen.',
        hmacGenerator: 'HMAC-Generator', hmacGeneratorDesc: 'Hashbasierte Nachrichtenauthentifizierungscodes aus Text und geheimen Schlüsseln berechnen.',
        jsonFormatter: 'JSON-Formatierer', jsonFormatterDesc: 'JSON formatieren, validieren und minimieren – mit verständlichen Fehlermeldungen.',
        sqlFormatter: 'SQL-Formatierer', sqlFormatterDesc: 'SQL-Abfragen mit Einrückung, Schlüsselwortformatierung und kompakter Ausgabe aufbereiten.',
        xmlFormatterTitle: 'XML-Formatierer', xmlFormatterDesc: 'XML formatieren oder komprimieren und dabei Struktur und Lesbarkeit bewahren.',
        chmodCalculatorDesc: 'Unix-Berechtigungen zwischen symbolischer und numerischer Schreibweise umwandeln.',
        chmodUtility: 'Linux-/Unix-Werkzeug', chmodIntroHtml: 'Linux-Dateiberechtigungen visuell erstellen und sofort in numerische, symbolische und ausführbare <strong>chmod</strong>-Befehle umwandeln. Alles läuft lokal in deinem Browser.',
        resetTo755: 'Auf 755 zurücksetzen', permissionMatrix: 'Berechtigungsmatrix', permissionWeights: 'Lesen 4 · Schreiben 2 · Ausführen 1',
        permission: 'Berechtigung', owner: 'Besitzer (u)', group: 'Gruppe (g)', public: 'Öffentlich (o)', read: 'Lesen', write: 'Schreiben', execute: 'Ausführen',
        fileDirectoryPath: 'Datei- oder Verzeichnispfad', copyChmod: 'chmod kopieren', numeric: 'Numerisch', symbolic: 'Symbolisch', chmodCommand: 'chmod-Befehl', symbolicCommand: 'Symbolischer Befehl', copy: 'Kopieren', commonPresets: 'Häufige Vorgaben',
        presetScripts: '755 · Skripte', presetFiles: '644 · Dateien', presetPrivate: '700 · Privat', presetShared: '775 · Gemeinsam', presetSecrets: '600 · Geheim',
        readValue: 'Lesen = 4', writeValue: 'Schreiben = 2', executeValue: 'Ausführen = 1',
        readHelp: 'Erlaubt das Anzeigen von Dateiinhalten oder Verzeichnislisten.', writeHelp: 'Erlaubt das Bearbeiten von Dateien sowie das Erstellen und Entfernen von Verzeichniseinträgen.', executeHelp: 'Erlaubt das Ausführen einer Datei oder das Betreten und Durchlaufen eines Verzeichnisses.',
        developmentJson: 'Entwicklung / JSON', jsonPageTitle: 'JSON formatieren', jsonPageIntro: 'JSON unten einfügen, um es zu validieren und zu formatieren. Navigation, Werbebereiche und Footer werden separat eingebunden.',
        jsonInput: 'JSON-Eingabe', formatJson: 'JSON formatieren', minify: 'Minimieren', clear: 'Leeren',
        scrollTop: 'Nach oben scrollen', scrollBottom: 'Nach unten scrollen', chooseLanguage: 'Sprache wählen', toggleSidebar: 'Seitenleiste umschalten', closeSidebar: 'Seitenleiste schließen'
      },
      es: {
        searchDeveloperTools: 'Buscar herramientas de desarrollo', searchTools: 'Buscar herramientas...',
        development: 'Desarrollo', converter: 'Conversores', web: 'Web',
        gitCheatsheet: 'Guía rápida de Git', randomPortGenerator: 'Generador de puertos aleatorios', crontabGenerator: 'Generador de Crontab',
        jsonPrettifyFormat: 'Formatear JSON', jsonMinify: 'Minificar JSON', jsonToCsv: 'JSON a CSV',
        sqlPrettifyFormat: 'Formatear SQL', chmodCalculator: 'Calculadora Chmod', dockerRunConverter: 'Conversor Docker run', xmlFormatter: 'Formateador XML',
        unitConverter: 'Conversor de unidades', timestampConverter: 'Conversor de marcas de tiempo', colorConverter: 'Conversor de color', urlParser: 'Analizador de URL', httpStatusExplorer: 'Explorador de estado HTTP',
        developerUtilities: 'Utilidades para desarrolladores', allTools: 'Todas las herramientas', privacy: 'Privacidad', feedback: 'Comentarios',
        footerTagline: 'DevKit Studio — utilidades rápidas para desarrolladores, directamente en el navegador.',
        developerToolbox: 'Caja de herramientas', dashboardDescription: 'Utilidades rápidas para código, seguridad, datos y flujos de trabajo web.',
        all: 'Todo', generate: 'Generar', security: 'Seguridad', format: 'Formato', openTool: 'Abrir herramienta',
        noToolsFound: 'No se encontraron herramientas', noToolsFoundHint: 'Prueba otra palabra clave o restablece el filtro de categoría.',
        tokenGenerator: 'Generador de tokens', tokenGeneratorDesc: 'Crea cadenas aleatorias seguras con longitud, conjuntos de caracteres y ajustes predefinidos.',
        hashText: 'Hash de texto', hashTextDesc: 'Genera hashes MD5, SHA-1, SHA-256 y SHA-512 en una interfaz limpia.',
        bcrypt: 'Bcrypt', bcryptDesc: 'Genera y compara hashes de contraseñas con un coste configurable.',
        uuidGenerator: 'Generador UUID', uuidGeneratorDesc: 'Crea UUID compatibles con estándares al instante, incluida la generación por lotes.',
        ulidGenerator: 'Generador ULID', ulidGeneratorDesc: 'Genera identificadores ordenables lexicográficamente para sistemas distribuidos modernos.',
        encryptDecrypt: 'Cifrar / descifrar', encryptDecryptDesc: 'Codifica y descodifica texto con ajustes claros y resultados listos para copiar.',
        bip39Passphrase: 'Frase BIP39', bip39PassphraseDesc: 'Genera frases mnemónicas compatibles con BIP39 con opciones de entropía.',
        hmacGenerator: 'Generador HMAC', hmacGeneratorDesc: 'Calcula códigos HMAC a partir de texto y claves secretas.',
        jsonFormatter: 'Formateador JSON', jsonFormatterDesc: 'Embellece, valida y minifica JSON con mensajes de error claros.',
        sqlFormatter: 'Formateador SQL', sqlFormatterDesc: 'Formatea consultas SQL con sangría, estilo de palabras clave y salida compacta.',
        xmlFormatterTitle: 'Formateador XML', xmlFormatterDesc: 'Embellece o compacta XML conservando la estructura y la legibilidad.',
        chmodCalculatorDesc: 'Convierte permisos Unix entre notación simbólica y numérica.',
        chmodUtility: 'Utilidad Linux / Unix', chmodIntroHtml: 'Configura visualmente los permisos de archivos Linux y conviértelos al instante en comandos <strong>chmod</strong> numéricos, simbólicos y listos para ejecutar. Todo se procesa localmente en tu navegador.',
        resetTo755: 'Restablecer a 755', permissionMatrix: 'Matriz de permisos', permissionWeights: 'Lectura 4 · Escritura 2 · Ejecución 1',
        permission: 'Permiso', owner: 'Propietario (u)', group: 'Grupo (g)', public: 'Público (o)', read: 'Lectura', write: 'Escritura', execute: 'Ejecución',
        fileDirectoryPath: 'Ruta de archivo o directorio', copyChmod: 'Copiar chmod', numeric: 'Numérico', symbolic: 'Simbólico', chmodCommand: 'Comando chmod', symbolicCommand: 'Comando simbólico', copy: 'Copiar', commonPresets: 'Ajustes comunes',
        presetScripts: '755 · Scripts', presetFiles: '644 · Archivos', presetPrivate: '700 · Privado', presetShared: '775 · Compartido', presetSecrets: '600 · Secretos',
        readValue: 'Lectura = 4', writeValue: 'Escritura = 2', executeValue: 'Ejecución = 1',
        readHelp: 'Permite ver el contenido de archivos o listar el contenido de directorios.', writeHelp: 'Permite editar archivos o crear y eliminar elementos dentro de un directorio.', executeHelp: 'Permite ejecutar un archivo o entrar y recorrer un directorio.',
        developmentJson: 'Desarrollo / JSON', jsonPageTitle: 'Formatear JSON', jsonPageIntro: 'Pega JSON abajo para validarlo y formatearlo. La navegación, los espacios publicitarios y el pie de página se importan por separado.',
        jsonInput: 'Entrada JSON', formatJson: 'Formatear JSON', minify: 'Minificar', clear: 'Limpiar',
        scrollTop: 'Ir arriba', scrollBottom: 'Ir abajo', chooseLanguage: 'Elegir idioma', toggleSidebar: 'Mostrar u ocultar barra lateral', closeSidebar: 'Cerrar barra lateral'
      }
    };

    const languageNames = { en: 'English', de: 'Deutsch', es: 'Español' };

    function translateValue(key, lang) {
      return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
    }

    function applyLanguage(lang, announce = false) {
      const next = I18N[lang] ? lang : 'en';
      document.documentElement.lang = next;
      writeStorage(STORAGE.language, next);

      document.querySelectorAll('[data-i18n]').forEach(element => {
        element.textContent = translateValue(element.dataset.i18n, next);
      });
      document.querySelectorAll('[data-i18n-html]').forEach(element => {
        element.innerHTML = translateValue(element.dataset.i18nHtml, next);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        element.setAttribute('placeholder', translateValue(element.dataset.i18nPlaceholder, next));
      });
      document.querySelectorAll('[data-i18n-title]').forEach(element => {
        element.setAttribute('title', translateValue(element.dataset.i18nTitle, next));
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        element.setAttribute('aria-label', translateValue(element.dataset.i18nAria, next));
      });

      const label = document.querySelector('.language-label');
      if (label) label.textContent = languageNames[next];

      document.querySelectorAll('.language-menu [data-lang]').forEach(item => {
        const selected = item.dataset.lang === next;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-checked', String(selected));
      });

      document.dispatchEvent(new CustomEvent('devkit:language-changed', { detail: { language: next } }));
      if (announce) showPreferenceToast(`${languageNames[next]} selected`);
    }

    const initialLanguage = readStorage(STORAGE.language, 'en');
    applyLanguage(initialLanguage);

    document.querySelectorAll('.language-menu [data-lang]').forEach(item => {
      item.addEventListener('click', event => {
        event.preventDefault();
        applyLanguage(item.dataset.lang || 'en', true);
      });
    });

    sidebarToggle.addEventListener('click', () => {
      if (isDesktop()) {
        appShell.classList.toggle('sidebar-collapsed');
        writeStorage(
          STORAGE.sidebar,
          appShell.classList.contains('sidebar-collapsed') ? '1' : '0'
        );
      } else {
        appShell.classList.toggle('sidebar-mobile-open');
      }
    });

    if (readStorage(STORAGE.sidebar) === '1' && isDesktop()) {
      appShell.classList.add('sidebar-collapsed');
    }

    function closeMobileSidebar() {
      appShell.classList.remove('sidebar-mobile-open');
    }

    mobileSidebarClose?.addEventListener('click', closeMobileSidebar);
    sidebarBackdrop?.addEventListener('click', closeMobileSidebar);

    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });

    function applyFilters() {
      if (!cards.length) return;

      const q = (globalSearch?.value || mobileSearch?.value || '').trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(card => {
        const searchable = `${card.dataset.name || ''} ${card.textContent || ''}`.toLowerCase();
        const matchesSearch = !q || searchable.includes(q);
        const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
        const visible = matchesSearch && matchesFilter;
        card.classList.toggle('is-hidden', !visible);
        if (visible) visibleCount += 1;
      });

      emptyState?.classList.toggle('d-none', visibleCount !== 0);
    }

    globalSearch?.addEventListener('input', () => {
      if (mobileSearch) mobileSearch.value = globalSearch.value;
      applyFilters();
    });

    mobileSearch?.addEventListener('input', () => {
      if (globalSearch) globalSearch.value = mobileSearch.value;
      applyFilters();
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
        applyFilters();
      });
    });

    // ---------------------------------------------------------------------
    // Sidebar item sorting (saved locally, independently for each category)
    // ---------------------------------------------------------------------
    function initSidebarSorting() {
      const sidebarNav = document.getElementById('sidebarNav');
      if (!sidebarNav) return;

      // A menu is the top-level category button + the collapse panel immediately
      // associated with it. Categories themselves are sortable, while tool links
      // remain sortable only inside their own category.
      const getMenuPairs = () => [...sidebarNav.querySelectorAll(':scope > .nav-section')]
        .map(button => {
          const target = button.getAttribute('data-bs-target') || '';
          const id = target.startsWith('#') ? target.slice(1) : target;
          const section = id ? document.getElementById(id) : null;
          return id && section ? { id, button, section } : null;
        })
        .filter(Boolean);

      const applyMenuOrder = order => {
        const pairs = getMenuPairs();
        const byId = new Map(pairs.map(pair => [pair.id, pair]));
        const requested = Array.isArray(order) ? order : [];
        const normalized = [...new Set([
          ...requested.filter(id => byId.has(id)),
          ...pairs.map(pair => pair.id)
        ])];

        normalized.forEach(id => {
          const pair = byId.get(id);
          if (!pair) return;
          sidebarNav.appendChild(pair.button);
          sidebarNav.appendChild(pair.section);
        });
      };

      const saveSidebarMenuOrder = () => {
        const order = getMenuPairs().map(pair => pair.id);
        writeStorage(STORAGE.sidebarMenuOrder, JSON.stringify(order));
      };

      // Restore category/menu ordering before restoring the individual tools.
      applyMenuOrder(readJson(STORAGE.sidebarMenuOrder, []));

      const sections = [...sidebarNav.querySelectorAll(':scope > .collapse')];
      const saved = readJson(STORAGE.sidebarOrder, {});

      const saveSidebarOrder = () => {
        const state = {};
        [...sidebarNav.querySelectorAll(':scope > .collapse')].forEach(section => {
          state[section.id] = [...section.querySelectorAll(':scope > .tool-link')]
            .map(link => link.dataset.navId)
            .filter(Boolean);
        });
        writeStorage(STORAGE.sidebarOrder, JSON.stringify(state));
      };

      // Restore each category without moving tools across categories.
      sections.forEach(section => {
        const links = [...section.querySelectorAll(':scope > .tool-link')];
        const byId = new Map(links.map(link => [link.dataset.navId, link]));
        const requested = Array.isArray(saved?.[section.id]) ? saved[section.id] : [];
        const order = [...new Set([
          ...requested.filter(id => byId.has(id)),
          ...links.map(link => link.dataset.navId)
        ])];
        order.forEach(id => byId.get(id) && section.appendChild(byId.get(id)));
      });

      // -------------------------------------------------------------------
      // Sort the top-level sidebar menus/categories themselves.
      // -------------------------------------------------------------------
      function ensureMenuHandle(pair) {
        let handle = pair.button.querySelector('.sidebar-menu-drag-handle');
        if (handle) return handle;

        handle = document.createElement('i');
        handle.className = 'bi bi-grip-vertical sidebar-menu-drag-handle';
        handle.setAttribute('role', 'button');
        handle.setAttribute('tabindex', '0');
        const name = pair.button.querySelector('span')?.textContent?.trim() || 'menu';
        handle.setAttribute('aria-label', `Drag ${name} menu to reorder sidebar sections`);
        handle.setAttribute('title', 'Drag menu to reorder · Arrow keys also work');

        const arrow = pair.button.querySelector('.section-arrow');
        pair.button.insertBefore(handle, arrow || null);
        return handle;
      }

      function moveMenu(pairId, direction) {
        const pairs = getMenuPairs();
        const index = pairs.findIndex(pair => pair.id === pairId);
        if (index < 0) return;

        let target = index;
        if (direction === 'home') target = 0;
        else if (direction === 'end') target = pairs.length - 1;
        else target = Math.max(0, Math.min(pairs.length - 1, index + direction));
        if (target === index) return;

        const ids = pairs.map(pair => pair.id);
        const [moved] = ids.splice(index, 1);
        ids.splice(target, 0, moved);
        applyMenuOrder(ids);
        saveSidebarMenuOrder();
        showPreferenceToast('Sidebar menu order saved on this browser');
        requestAnimationFrame(() => {
          const movedPair = getMenuPairs().find(item => item.id === pairId);
          movedPair?.button.querySelector('.sidebar-menu-drag-handle')?.focus();
        });
      }

      getMenuPairs().forEach(pair => {
        const handle = ensureMenuHandle(pair);

        handle.addEventListener('click', event => {
          // The drag handle lives inside the collapse button. Never toggle the
          // menu when the user interacts with the sorting handle.
          event.preventDefault();
          event.stopPropagation();
        });

        handle.addEventListener('keydown', event => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            event.stopPropagation();
            moveMenu(pair.id, -1);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            moveMenu(pair.id, 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            event.stopPropagation();
            moveMenu(pair.id, 'home');
          } else if (event.key === 'End') {
            event.preventDefault();
            event.stopPropagation();
            moveMenu(pair.id, 'end');
          }
        });

        handle.addEventListener('pointerdown', downEvent => {
          if (downEvent.button !== 0) return;
          downEvent.preventDefault();
          downEvent.stopPropagation();

          const currentPair = getMenuPairs().find(item => item.id === pair.id);
          if (!currentPair) return;

          const pointerId = downEvent.pointerId;
          const startX = downEvent.clientX;
          const startY = downEvent.clientY;
          const buttonRect = currentPair.button.getBoundingClientRect();
          const sectionRect = currentPair.section.getBoundingClientRect();
          const expanded = currentPair.section.classList.contains('show');
          const groupHeight = expanded
            ? Math.max(buttonRect.height, sectionRect.bottom - buttonRect.top)
            : buttonRect.height;
          const offsetX = startX - buttonRect.left;
          const offsetY = startY - buttonRect.top;
          const originalOrder = getMenuPairs().map(item => item.id);
          let active = false;
          let cancelled = false;
          let ghost = null;
          let placeholder = null;
          let lastY = startY;
          let rafId = 0;

          const positionGhost = (x, y) => {
            if (!ghost) return;
            ghost.style.left = `${Math.round(x - offsetX)}px`;
            ghost.style.top = `${Math.round(y - offsetY)}px`;
          };

          const startDrag = (x, y) => {
            if (active) return;
            active = true;
            document.body.classList.add('sidebar-menu-sorting');

            placeholder = document.createElement('div');
            placeholder.className = 'sidebar-menu-drop-placeholder';
            placeholder.style.height = `${Math.max(44, groupHeight)}px`;
            sidebarNav.insertBefore(placeholder, currentPair.button);

            ghost = currentPair.button.cloneNode(true);
            ghost.classList.add('sidebar-menu-drag-ghost');
            ghost.removeAttribute('data-bs-toggle');
            ghost.removeAttribute('data-bs-target');
            ghost.style.width = `${buttonRect.width}px`;
            ghost.style.height = `${buttonRect.height}px`;
            document.body.appendChild(ghost);

            currentPair.button.remove();
            currentPair.section.remove();
            positionGhost(x, y);
          };

          const updatePlaceholder = y => {
            if (!active || !placeholder) return;
            const candidates = getMenuPairs();
            const before = candidates.find(candidate => {
              const top = candidate.button.getBoundingClientRect().top;
              const sectionBottom = candidate.section.classList.contains('show')
                ? candidate.section.getBoundingClientRect().bottom
                : candidate.button.getBoundingClientRect().bottom;
              return y < top + (sectionBottom - top) / 2;
            });

            if (before) sidebarNav.insertBefore(placeholder, before.button);
            else sidebarNav.appendChild(placeholder);
          };

          const autoScrollSidebar = () => {
            if (!active) return;
            const rect = sidebarNav.getBoundingClientRect();
            const edge = 58;
            let amount = 0;
            if (lastY < rect.top + edge) amount = -Math.ceil((rect.top + edge - lastY) / 6);
            else if (lastY > rect.bottom - edge) amount = Math.ceil((lastY - (rect.bottom - edge)) / 6);
            if (amount) {
              sidebarNav.scrollTop += Math.max(-13, Math.min(13, amount));
              updatePlaceholder(lastY);
            }
            rafId = requestAnimationFrame(autoScrollSidebar);
          };

          const onMove = moveEvent => {
            if (moveEvent.pointerId !== pointerId) return;
            lastY = moveEvent.clientY;
            const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
            if (!active && distance < 5) return;

            startDrag(moveEvent.clientX, moveEvent.clientY);
            moveEvent.preventDefault();
            positionGhost(moveEvent.clientX, moveEvent.clientY);
            updatePlaceholder(moveEvent.clientY);
            if (!rafId) rafId = requestAnimationFrame(autoScrollSidebar);
          };

          const cleanupListeners = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
            document.removeEventListener('keydown', onEscape, true);
            if (rafId) cancelAnimationFrame(rafId);
          };

          const finish = () => {
            cleanupListeners();
            if (!active) return;

            // Put the pair where the live placeholder ended up.
            placeholder?.replaceWith(currentPair.button);
            currentPair.button.after(currentPair.section);

            if (cancelled) {
              applyMenuOrder(originalOrder);
            } else {
              saveSidebarMenuOrder();
              showPreferenceToast('Sidebar menu order saved on this browser');
            }

            ghost?.remove();
            document.body.classList.remove('sidebar-menu-sorting');
            requestAnimationFrame(() => currentPair.button.querySelector('.sidebar-menu-drag-handle')?.focus());
          };

          const onUp = upEvent => {
            if (upEvent.pointerId !== pointerId) return;
            finish();
          };

          const onCancel = cancelEvent => {
            if (cancelEvent.pointerId !== pointerId) return;
            cancelled = true;
            finish();
          };

          const onEscape = keyEvent => {
            if (keyEvent.key !== 'Escape' || !active) return;
            keyEvent.preventDefault();
            cancelled = true;
            finish();
          };

          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onCancel);
          document.addEventListener('keydown', onEscape, true);
        });
      });

      // -------------------------------------------------------------------
      // Sort tools inside each menu/category.
      // -------------------------------------------------------------------
      function ensureSidebarHandle(link) {
        let handle = link.querySelector('.sidebar-drag-handle');
        if (handle) return handle;

        handle = document.createElement('i');
        handle.className = 'bi bi-grip-vertical sidebar-drag-handle';
        handle.setAttribute('role', 'button');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('aria-label', `Drag ${link.textContent.trim()} to reorder in sidebar`);
        handle.setAttribute('title', 'Drag to reorder · Arrow keys also work');
        link.appendChild(handle);
        return handle;
      }

      function moveSidebarLink(link, direction) {
        const section = link.parentElement;
        if (!section) return;
        const links = [...section.querySelectorAll(':scope > .tool-link')];
        const index = links.indexOf(link);
        if (index < 0) return;

        let target = index;
        if (direction === 'home') target = 0;
        else if (direction === 'end') target = links.length - 1;
        else target = Math.max(0, Math.min(links.length - 1, index + direction));
        if (target === index) return;

        const without = links.filter(item => item !== link);
        const reference = without[target] || null;
        if (reference) section.insertBefore(link, reference);
        else section.appendChild(link);

        saveSidebarOrder();
        showPreferenceToast('Sidebar tool order saved on this browser');
        requestAnimationFrame(() => link.querySelector('.sidebar-drag-handle')?.focus());
      }

      [...sidebarNav.querySelectorAll(':scope > .collapse')].forEach(section => {
        [...section.querySelectorAll(':scope > .tool-link')].forEach(link => {
          const handle = ensureSidebarHandle(link);

          handle.addEventListener('click', event => {
            // Prevent the parent anchor from navigating when the handle is clicked.
            event.preventDefault();
            event.stopPropagation();
          });

          handle.addEventListener('keydown', event => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              event.stopPropagation();
              moveSidebarLink(link, -1);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              event.stopPropagation();
              moveSidebarLink(link, 1);
            } else if (event.key === 'Home') {
              event.preventDefault();
              event.stopPropagation();
              moveSidebarLink(link, 'home');
            } else if (event.key === 'End') {
              event.preventDefault();
              event.stopPropagation();
              moveSidebarLink(link, 'end');
            }
          });

          handle.addEventListener('pointerdown', downEvent => {
            if (downEvent.button !== 0) return;
            downEvent.preventDefault();
            downEvent.stopPropagation();

            const pointerId = downEvent.pointerId;
            const startX = downEvent.clientX;
            const startY = downEvent.clientY;
            const startRect = link.getBoundingClientRect();
            const offsetX = startX - startRect.left;
            const offsetY = startY - startRect.top;
            const originalSectionOrder = [...section.querySelectorAll(':scope > .tool-link')]
              .map(item => item.dataset.navId)
              .filter(Boolean);
            let active = false;
            let cancelled = false;
            let ghost = null;
            let placeholder = null;
            let lastY = startY;
            let rafId = 0;

            const positionGhost = (x, y) => {
              if (!ghost) return;
              ghost.style.left = `${Math.round(x - offsetX)}px`;
              ghost.style.top = `${Math.round(y - offsetY)}px`;
            };

            const startDrag = (x, y) => {
              if (active) return;
              active = true;
              document.body.classList.add('sidebar-sorting');

              placeholder = document.createElement('div');
              placeholder.className = 'sidebar-drop-placeholder';
              placeholder.style.height = `${startRect.height}px`;
              section.insertBefore(placeholder, link);

              ghost = link.cloneNode(true);
              ghost.classList.add('sidebar-drag-ghost');
              ghost.removeAttribute('href');
              ghost.style.width = `${startRect.width}px`;
              ghost.style.height = `${startRect.height}px`;
              document.body.appendChild(ghost);

              link.remove();
              positionGhost(x, y);
            };

            const updatePlaceholder = y => {
              if (!active || !placeholder) return;
              const candidates = [...section.querySelectorAll(':scope > .tool-link')];
              const before = candidates.find(item => {
                const rect = item.getBoundingClientRect();
                return y < rect.top + rect.height / 2;
              });
              if (before) section.insertBefore(placeholder, before);
              else section.appendChild(placeholder);
            };

            const autoScrollSidebar = () => {
              if (!active) return;
              const rect = sidebarNav.getBoundingClientRect();
              const edge = 54;
              let amount = 0;
              if (lastY < rect.top + edge) amount = -Math.ceil((rect.top + edge - lastY) / 6);
              else if (lastY > rect.bottom - edge) amount = Math.ceil((lastY - (rect.bottom - edge)) / 6);
              if (amount) {
                sidebarNav.scrollTop += Math.max(-12, Math.min(12, amount));
                updatePlaceholder(lastY);
              }
              rafId = requestAnimationFrame(autoScrollSidebar);
            };

            const onMove = moveEvent => {
              if (moveEvent.pointerId !== pointerId) return;
              lastY = moveEvent.clientY;
              const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
              if (!active && distance < 5) return;

              startDrag(moveEvent.clientX, moveEvent.clientY);
              moveEvent.preventDefault();
              positionGhost(moveEvent.clientX, moveEvent.clientY);
              updatePlaceholder(moveEvent.clientY);
              if (!rafId) rafId = requestAnimationFrame(autoScrollSidebar);
            };

            const cleanupListeners = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              window.removeEventListener('pointercancel', onCancel);
              document.removeEventListener('keydown', onEscape, true);
              if (rafId) cancelAnimationFrame(rafId);
            };

            const finish = () => {
              cleanupListeners();
              if (!active) return;

              if (cancelled) {
                placeholder?.replaceWith(link);
                const map = new Map([...section.querySelectorAll(':scope > .tool-link')].map(item => [item.dataset.navId, item]));
                originalSectionOrder.forEach(id => map.get(id) && section.appendChild(map.get(id)));
              } else {
                placeholder?.replaceWith(link);
                saveSidebarOrder();
                showPreferenceToast('Sidebar tool order saved on this browser');
              }

              ghost?.remove();
              document.body.classList.remove('sidebar-sorting');
              requestAnimationFrame(() => link.querySelector('.sidebar-drag-handle')?.focus());
            };

            const onUp = upEvent => {
              if (upEvent.pointerId !== pointerId) return;
              finish();
            };

            const onCancel = cancelEvent => {
              if (cancelEvent.pointerId !== pointerId) return;
              cancelled = true;
              finish();
            };

            const onEscape = keyEvent => {
              if (keyEvent.key !== 'Escape' || !active) return;
              keyEvent.preventDefault();
              cancelled = true;
              finish();
            };

            window.addEventListener('pointermove', onMove, { passive: false });
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onCancel);
            document.addEventListener('keydown', onEscape, true);
          });
        });
      });
    }

    initSidebarSorting();

    // ---------------------------------------------------------------------
    // Dashboard personalization: favorites + robust pointer/grid sorting
    // ---------------------------------------------------------------------
    if (toolsGrid && cards.length) {
      cards.forEach((card, index) => {
        if (!card.dataset.toolId) {
          const fallback = (card.dataset.name || `tool-${index + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          card.dataset.toolId = fallback || `tool-${index + 1}`;
        }

        // Clean any inline positioning left by an interrupted previous drag.
        ['position', 'z-index', 'width', 'height', 'margin', 'pointer-events', 'left', 'top']
          .forEach(prop => card.style.removeProperty(prop));
        card.classList.remove('is-dragging');
      });

      const allIds = cards.map(card => card.dataset.toolId);
      const savedOrder = readJson(STORAGE.order, []);
      const validSaved = Array.isArray(savedOrder)
        ? savedOrder.filter(id => allIds.includes(id))
        : [];
      let toolOrder = [...new Set([...validSaved, ...allIds])];
      const cardMap = new Map(cards.map(card => [card.dataset.toolId, card]));

      const savedFavorites = readJson(STORAGE.favorites, []);
      const favorites = new Set(
        Array.isArray(savedFavorites) ? savedFavorites.filter(id => allIds.includes(id)) : []
      );

      const toolsBeforeAd = () => {
        if (window.matchMedia('(max-width: 575.98px)').matches) return 2;
        if (window.matchMedia('(max-width: 1199.98px)').matches) return 4;
        return 8;
      };

      const saveOrder = () => writeStorage(STORAGE.order, JSON.stringify(toolOrder));
      const saveFavorites = () => writeStorage(STORAGE.favorites, JSON.stringify([...favorites]));

      function renderDashboardOrder() {
        toolsGrid.querySelectorAll('.tool-drop-placeholder').forEach(node => node.remove());
        const fragment = document.createDocumentFragment();
        const adAfter = Math.min(toolsBeforeAd(), toolOrder.length);

        toolOrder.forEach((id, index) => {
          if (dashboardAd && index === adAfter) fragment.appendChild(dashboardAd);
          const card = cardMap.get(id);
          if (card) fragment.appendChild(card);
        });

        if (dashboardAd && adAfter >= toolOrder.length) fragment.appendChild(dashboardAd);
        toolsGrid.appendChild(fragment);
      }

      function updateFavoriteUi(card, button, isFavorite) {
        card.classList.toggle('is-favorite', isFavorite);
        button.classList.toggle('active', isFavorite);
        button.setAttribute('aria-pressed', String(isFavorite));
        button.setAttribute(
          'aria-label',
          `${isFavorite ? 'Remove' : 'Add'} ${card.querySelector('h3')?.textContent?.trim() || 'tool'} ${isFavorite ? 'from' : 'to'} favorites`
        );
        button.innerHTML = isFavorite
          ? '<i class="bi bi-heart-fill"></i>'
          : '<i class="bi bi-heart"></i>';
      }

      function ensureCardControls(card) {
        const top = card.querySelector('.tool-card-top');
        const favoriteButton = card.querySelector('.favorite-btn');
        if (!top || !favoriteButton) return null;

        let controls = top.querySelector('.tool-card-controls');
        if (!controls) {
          controls = document.createElement('div');
          controls.className = 'tool-card-controls';
          top.appendChild(controls);
          controls.appendChild(favoriteButton);
        }

        let handle = controls.querySelector('.drag-handle');
        if (!handle) {
          handle = document.createElement('button');
          handle.type = 'button';
          handle.className = 'drag-handle';
          handle.setAttribute('aria-label', `Drag ${card.querySelector('h3')?.textContent?.trim() || 'tool'} to reorder`);
          handle.setAttribute('title', 'Drag to reorder · Arrow keys also work');
          handle.innerHTML = '<i class="bi bi-grip-vertical"></i><span class="drag-handle-text">Move</span>';
          controls.insertBefore(handle, favoriteButton);
        }

        return { favoriteButton, handle };
      }

      cards.forEach(card => {
        const controls = ensureCardControls(card);
        if (!controls) return;
        const { favoriteButton } = controls;

        updateFavoriteUi(card, favoriteButton, favorites.has(card.dataset.toolId));

        favoriteButton.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const id = card.dataset.toolId;
          if (favorites.has(id)) favorites.delete(id);
          else favorites.add(id);
          saveFavorites();
          updateFavoriteUi(card, favoriteButton, favorites.has(id));
          showPreferenceToast(favorites.has(id) ? 'Added to favorites on this browser' : 'Removed from favorites');
        });
      });

      function reorderToIndex(sourceId, targetIndex) {
        const from = toolOrder.indexOf(sourceId);
        if (from < 0) return false;

        const next = toolOrder.filter(id => id !== sourceId);
        const clamped = Math.max(0, Math.min(next.length, targetIndex));
        next.splice(clamped, 0, sourceId);

        if (next.join('|') === toolOrder.join('|')) return false;
        toolOrder = next;
        renderDashboardOrder();
        saveOrder();
        return true;
      }

      function moveToolBy(sourceId, delta) {
        const from = toolOrder.indexOf(sourceId);
        if (from < 0) return;
        const target = Math.max(0, Math.min(toolOrder.length - 1, from + delta));
        if (target === from) return;

        if (reorderToIndex(sourceId, target)) {
          showPreferenceToast('Tool order saved on this browser');
          requestAnimationFrame(() => cardMap.get(sourceId)?.querySelector('.drag-handle')?.focus());
        }
      }

      function captureVisiblePositions(excludeId = '') {
        const positions = new Map();
        cards.forEach(item => {
          if (item.dataset.toolId === excludeId || item.classList.contains('is-hidden')) return;
          const rect = item.getBoundingClientRect();
          if (rect.width && rect.height) positions.set(item.dataset.toolId, rect);
        });
        return positions;
      }

      function animateReflow(before, excludeId = '') {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!Element.prototype.animate) return;

        cards.forEach(item => {
          const id = item.dataset.toolId;
          if (id === excludeId || item.classList.contains('is-hidden')) return;
          const first = before.get(id);
          if (!first) return;
          const last = item.getBoundingClientRect();
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          item.animate(
            [
              { transform: `translate3d(${dx}px, ${dy}px, 0)` },
              { transform: 'translate3d(0, 0, 0)' }
            ],
            { duration: 165, easing: 'cubic-bezier(.2,.8,.2,1)' }
          );
        });
      }

      function renderDashboardPreview(baseOrder, insertionIndex, placeholder, sourceId) {
        const sequence = [...baseOrder];
        const clamped = Math.max(0, Math.min(sequence.length, insertionIndex));
        sequence.splice(clamped, 0, '__DROP__');

        const before = captureVisiblePositions(sourceId);
        const fragment = document.createDocumentFragment();
        const adAfter = Math.min(toolsBeforeAd(), sequence.length);

        sequence.forEach((id, index) => {
          if (dashboardAd && index === adAfter) fragment.appendChild(dashboardAd);
          if (id === '__DROP__') {
            fragment.appendChild(placeholder);
          } else {
            const item = cardMap.get(id);
            if (item) fragment.appendChild(item);
          }
        });

        if (dashboardAd && adAfter >= sequence.length) fragment.appendChild(dashboardAd);
        toolsGrid.appendChild(fragment);
        animateReflow(before, sourceId);
      }

      // Grid-aware insertion. It selects the closest visual row first and then
      // the position inside that row. The user does not have to hit a card exactly.
      function getGridInsertionIndex(x, y, baseOrder) {
        const entries = baseOrder
          .map((id, orderIndex) => {
            const item = cardMap.get(id);
            if (!item || item.classList.contains('is-hidden')) return null;
            const rect = item.getBoundingClientRect();
            if (!rect.width || !rect.height) return null;
            return {
              id,
              orderIndex,
              rect,
              cx: rect.left + rect.width / 2,
              cy: rect.top + rect.height / 2
            };
          })
          .filter(Boolean)
          .sort((a, b) => Math.abs(a.rect.top - b.rect.top) < 18 ? a.rect.left - b.rect.left : a.rect.top - b.rect.top);

        if (!entries.length) return baseOrder.length;

        const rows = [];
        entries.forEach(entry => {
          let row = rows[rows.length - 1];
          const tolerance = Math.max(24, entry.rect.height * 0.38);
          if (!row || Math.abs(entry.cy - row.cy) > tolerance) {
            row = { items: [], cy: entry.cy, top: entry.rect.top, bottom: entry.rect.bottom };
            rows.push(row);
          }
          row.items.push(entry);
          row.cy = row.items.reduce((sum, item) => sum + item.cy, 0) / row.items.length;
          row.top = Math.min(row.top, entry.rect.top);
          row.bottom = Math.max(row.bottom, entry.rect.bottom);
        });

        rows.forEach(row => row.items.sort((a, b) => a.rect.left - b.rect.left));

        if (y < rows[0].top - 20) return entries[0].orderIndex;
        const lastRow = rows[rows.length - 1];
        if (y > lastRow.bottom + 20) {
          const lastItem = lastRow.items[lastRow.items.length - 1];
          return Math.min(baseOrder.length, lastItem.orderIndex + 1);
        }

        let selectedRow = rows[0];
        let bestDistance = Math.abs(y - selectedRow.cy);
        rows.slice(1).forEach(row => {
          const distance = Math.abs(y - row.cy);
          if (distance < bestDistance) {
            bestDistance = distance;
            selectedRow = row;
          }
        });

        for (const item of selectedRow.items) {
          if (x < item.cx) return item.orderIndex;
        }

        const lastItem = selectedRow.items[selectedRow.items.length - 1];
        return Math.min(baseOrder.length, lastItem.orderIndex + 1);
      }

      cards.forEach(card => {
        const handle = card.querySelector('.drag-handle');
        if (!handle) return;

        handle.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
        });

        handle.addEventListener('keydown', event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveToolBy(card.dataset.toolId, -1);
          } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            moveToolBy(card.dataset.toolId, 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            if (reorderToIndex(card.dataset.toolId, 0)) {
              showPreferenceToast('Moved to the first position');
              requestAnimationFrame(() => card.querySelector('.drag-handle')?.focus());
            }
          } else if (event.key === 'End') {
            event.preventDefault();
            if (reorderToIndex(card.dataset.toolId, toolOrder.length - 1)) {
              showPreferenceToast('Moved to the last position');
              requestAnimationFrame(() => card.querySelector('.drag-handle')?.focus());
            }
          }
        });

        handle.addEventListener('pointerdown', downEvent => {
          if (downEvent.button !== 0) return;
          downEvent.preventDefault();
          downEvent.stopPropagation();

          const pointerId = downEvent.pointerId;
          const sourceId = card.dataset.toolId;
          const originalOrder = [...toolOrder];
          const baseOrder = originalOrder.filter(id => id !== sourceId);
          let insertionIndex = Math.max(0, originalOrder.indexOf(sourceId));
          let active = false;
          let cancelled = false;
          let rafId = 0;
          let lastX = downEvent.clientX;
          let lastY = downEvent.clientY;

          const startX = downEvent.clientX;
          const startY = downEvent.clientY;
          const rect = card.getBoundingClientRect();
          const offsetX = startX - rect.left;
          const offsetY = startY - rect.top;

          const placeholder = document.createElement('div');
          placeholder.className = 'tool-drop-placeholder';
          placeholder.setAttribute('aria-hidden', 'true');
          placeholder.style.height = `${rect.height}px`;

          const positionDraggedCard = (x, y) => {
            card.style.left = `${Math.round(x - offsetX)}px`;
            card.style.top = `${Math.round(y - offsetY)}px`;
          };

          const updatePreview = () => {
            if (!active) return;
            const nextIndex = getGridInsertionIndex(lastX, lastY, baseOrder);
            if (nextIndex === insertionIndex && placeholder.isConnected) return;
            insertionIndex = nextIndex;
            renderDashboardPreview(baseOrder, insertionIndex, placeholder, sourceId);
          };

          const autoScrollLoop = () => {
            if (!active) return;
            const edge = Math.min(92, window.innerHeight * 0.16);
            let amount = 0;
            if (lastY < edge) amount = -Math.ceil((edge - lastY) / 5);
            else if (lastY > window.innerHeight - edge) amount = Math.ceil((lastY - (window.innerHeight - edge)) / 5);

            if (amount) {
              window.scrollBy(0, Math.max(-18, Math.min(18, amount)));
              updatePreview();
            }
            rafId = requestAnimationFrame(autoScrollLoop);
          };

          const startDragging = (x, y) => {
            if (active) return;
            active = true;
            document.body.classList.add('dashboard-dragging');
            card.classList.add('is-dragging');

            card.style.position = 'fixed';
            card.style.zIndex = '1400';
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.style.margin = '0';
            card.style.pointerEvents = 'none';
            document.body.appendChild(card);

            renderDashboardPreview(baseOrder, insertionIndex, placeholder, sourceId);
            positionDraggedCard(x, y);
            rafId = requestAnimationFrame(autoScrollLoop);
          };

          const onMove = moveEvent => {
            if (moveEvent.pointerId !== pointerId) return;
            lastX = moveEvent.clientX;
            lastY = moveEvent.clientY;
            const distance = Math.hypot(lastX - startX, lastY - startY);
            if (!active && distance < 5) return;

            startDragging(lastX, lastY);
            moveEvent.preventDefault();
            positionDraggedCard(lastX, lastY);
            updatePreview();
          };

          const cleanupListeners = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
            document.removeEventListener('keydown', onEscape, true);
            if (rafId) cancelAnimationFrame(rafId);
          };

          const cleanupDraggedCard = () => {
            card.classList.remove('is-dragging');
            ['position', 'z-index', 'width', 'height', 'margin', 'pointer-events', 'left', 'top']
              .forEach(prop => card.style.removeProperty(prop));
            document.body.classList.remove('dashboard-dragging');
            placeholder.remove();
          };

          const finish = () => {
            cleanupListeners();
            if (!active) return;

            cleanupDraggedCard();

            if (cancelled) {
              toolOrder = originalOrder;
              renderDashboardOrder();
              showPreferenceToast('Reorder cancelled');
            } else {
              const next = [...baseOrder];
              next.splice(Math.max(0, Math.min(baseOrder.length, insertionIndex)), 0, sourceId);
              const changed = next.join('|') !== originalOrder.join('|');
              toolOrder = next;
              renderDashboardOrder();
              if (changed) {
                saveOrder();
                showPreferenceToast('Tool order saved on this browser');
              }
            }

            requestAnimationFrame(() => card.querySelector('.drag-handle')?.focus());
          };

          const onUp = upEvent => {
            if (upEvent.pointerId !== pointerId) return;
            finish();
          };

          const onCancel = cancelEvent => {
            if (cancelEvent.pointerId !== pointerId) return;
            cancelled = true;
            finish();
          };

          const onEscape = keyEvent => {
            if (keyEvent.key !== 'Escape' || !active) return;
            keyEvent.preventDefault();
            cancelled = true;
            finish();
          };

          // Listen on window rather than the handle. The dragged card is moved out
          // of the grid, so global listeners make pointer-up reliable everywhere.
          window.addEventListener('pointermove', onMove, { passive: false });
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onCancel);
          document.addEventListener('keydown', onEscape, true);
        });
      });

      renderDashboardOrder();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderDashboardOrder, 120);
      });
    }

    // ---------- Shared page scroll controls ----------
    const scrollToTopButton = document.getElementById('scrollToTop');
    const scrollToBottomButton = document.getElementById('scrollToBottom');

    if (scrollToTopButton && scrollToBottomButton) {
      const updateScrollControls = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        const viewportBottom = scrollTop + window.innerHeight;
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        const threshold = 6;

        scrollToTopButton.disabled = scrollTop <= threshold;
        scrollToBottomButton.disabled = viewportBottom >= documentHeight - threshold;
      };

      scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      scrollToBottomButton.addEventListener('click', () => {
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.scrollTo({ top: documentHeight, behavior: 'smooth' });
      });

      let scrollRaf = 0;
      const scheduleScrollState = () => {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          updateScrollControls();
        });
      };

      window.addEventListener('scroll', scheduleScrollState, { passive: true });
      window.addEventListener('resize', scheduleScrollState);
      updateScrollControls();
      requestAnimationFrame(updateScrollControls);
    }

    // ---------- Keyboard/navigation ----------
    window.addEventListener('resize', () => {
      if (isDesktop()) closeMobileSidebar();
    });

    document.addEventListener('keydown', event => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        globalSearch?.focus();
        globalSearch?.select();
      }

      if (!typing && event.key === '/') {
        const toolGrid = document.getElementById('toolGrid');
        if (toolGrid) {
          event.preventDefault();
          toolGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        globalSearch?.focus();
      }

      if (event.key === 'Escape') {
        closeMobileSidebar();
        globalSearch?.blur();
        mobileSearch?.blur();
      }
    });

    cards.forEach(card => {
      card.tabIndex = 0;
      card.setAttribute('role', 'group');
    });

    // Re-apply language after dynamically generated drag handles/labels are present.
    applyLanguage(readStorage(STORAGE.language, 'en'));
  }

  document.addEventListener('devkit:layout-ready', initApp, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  } else {
    initApp();
  }
})();
