/**
 * Lightweight i18n system for Bot Commander Help
 * Loads locale JSON files and applies translations to elements with data-i18n attributes
 */
(function() {
    'use strict';

    const SUPPORTED_LANGS = ['en', 'es', 'ja', 'ko', 'ru', 'zh-CN'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'bc-help-lang';

    // Language display names
    const LANG_NAMES = {
        'en': 'English',
        'es': 'Español',
        'ja': '日本語',
        'ko': '한국어',
        'ru': 'Русский',
        'zh-CN': '中文'
    };

    // Short codes for badges
    const LANG_CODES = {
        'en': 'EN',
        'es': 'ES',
        'ja': 'JP',
        'ko': 'KO',
        'ru': 'RU',
        'zh-CN': 'CN'
    };

    // Detect user's preferred language
    function detectLanguage() {
        // Check localStorage first (user preference)
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGS.includes(stored)) {
            return stored;
        }

        // Check browser language
        const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (browserLang.startsWith('ja')) return 'ja';
        if (browserLang.startsWith('ko')) return 'ko';
        if (browserLang.startsWith('ru')) return 'ru';
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('zh')) return 'zh-CN';

        return DEFAULT_LANG;
    }

    // Get current language
    function getCurrentLang() {
        return document.documentElement.lang || detectLanguage();
    }

    // Set language and reload translations
    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        loadTranslations(lang);
        updateLanguageToggle(lang);
    }

    // Load translations from JSON file
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            const translations = await response.json();
            applyTranslations(translations);
        } catch (error) {
            console.warn(`i18n: Could not load translations for "${lang}"`, error);
            // Fallback to English if not already
            if (lang !== DEFAULT_LANG) {
                loadTranslations(DEFAULT_LANG);
            }
        }
    }

    // Apply translations to DOM elements
    function applyTranslations(translations) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = getNestedValue(translations, key);
            if (value !== undefined) {
                // Check if element has data-i18n-attr for attribute translation
                const attr = el.getAttribute('data-i18n-attr');
                if (attr) {
                    el.setAttribute(attr, value);
                } else {
                    el.innerHTML = value;
                }
            }
        });
    }

    // Get nested object value by dot notation
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) =>
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }

    // Update language toggle button state
    function updateLanguageToggle(lang) {
        const toggles = document.querySelectorAll('.lang-toggle');
        const code = LANG_CODES[lang] || 'EN';
        const ariaLabel = `Current language: ${LANG_NAMES[lang] || 'English'}. Click to change.`;

        toggles.forEach(toggle => {
            toggle.setAttribute('data-current-lang', lang);
            toggle.setAttribute('aria-label', ariaLabel);

            // Handle nav drawer button with badge
            const badge = toggle.querySelector('.nav-drawer-lang-badge');
            if (badge) {
                badge.textContent = code;
            } else {
                // Simple button with just text
                toggle.textContent = code;
            }
        });
    }

    // Create language picker dropdown
    function createLanguagePicker() {
        const picker = document.createElement('div');
        picker.className = 'lang-picker';
        picker.innerHTML = SUPPORTED_LANGS.map(lang => `
            <button class="lang-picker-option" data-lang="${lang}">
                <span class="lang-picker-code">${LANG_CODES[lang]}</span>
                <span class="lang-picker-name">${LANG_NAMES[lang]}</span>
            </button>
        `).join('');
        return picker;
    }

    // Initialize language toggle
    function initLanguageToggle() {
        const toggles = document.querySelectorAll('.lang-toggle');

        toggles.forEach(toggle => {
            const picker = createLanguagePicker();
            toggle.parentElement.style.position = 'relative';
            toggle.parentElement.appendChild(picker);

            // Toggle picker visibility
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = picker.classList.contains('active');
                // Close all other pickers first
                document.querySelectorAll('.lang-picker.active').forEach(p => p.classList.remove('active'));
                if (!isOpen) {
                    picker.classList.add('active');
                }
            });

            // Handle language selection
            picker.addEventListener('click', (e) => {
                const option = e.target.closest('.lang-picker-option');
                if (option) {
                    const lang = option.getAttribute('data-lang');
                    setLanguage(lang);
                    picker.classList.remove('active');
                }
            });
        });

        // Close picker when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.lang-picker.active').forEach(p => p.classList.remove('active'));
        });
    }

    // Initialize i18n
    function init() {
        const lang = detectLanguage();
        document.documentElement.lang = lang;
        loadTranslations(lang);
        updateLanguageToggle(lang);
        initLanguageToggle();
    }

    // Expose API
    window.i18n = {
        setLanguage,
        getCurrentLang,
        detectLanguage,
        SUPPORTED_LANGS,
        LANG_NAMES,
        LANG_CODES
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
