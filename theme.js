(function () {
  const DEFAULTS = {
    theme: "system",
    compactMode: false,
    reduceMotion: false,
    largeText: false,
    highContrast: false
  };

  function getSettings() {
    try {
      return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem("insiderSettings")) || {}) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function apply(settings) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = settings.theme === "dark" || (settings.theme === "system" && systemDark);

    document.body.classList.toggle("insider-dark", dark);
    document.body.classList.toggle("insider-compact", !!settings.compactMode);
    document.body.classList.toggle("insider-large-text", !!settings.largeText);
    document.body.classList.toggle("insider-high-contrast", !!settings.highContrast);
    document.body.classList.toggle("insider-reduce-motion", !!settings.reduceMotion);

    root.dataset.insiderTheme = dark ? "dark" : "light";
  }

  function init() {
    apply(getSettings());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", () => {
      const settings = getSettings();
      if (settings.theme === "system") apply(settings);
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "insiderSettings") apply(getSettings());
    });

    window.addEventListener("insider-settings-changed", () => apply(getSettings()));
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }

  window.InsiderSettings = {
    get: getSettings,
    apply
  };
})();
