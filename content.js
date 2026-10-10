const styleEl = document.createElement('style');
styleEl.id = 'force-theme-dynamic-style';

function updateStyles(theme, brightness) {
  const root = document.documentElement;
  if (!root) {
    requestAnimationFrame(() => updateStyles(theme, brightness));
    return;
  }

  // Inject the style element if not present
  if (!document.getElementById('force-theme-dynamic-style')) {
    root.appendChild(styleEl);
  }

  let cssText = '';

  if (theme === 'dark') {
    // Dark mode CSS with brightness
    cssText = `
      html {
        filter: invert(1) hue-rotate(180deg) brightness(${brightness}%) !important;
        background-color: white !important;
      }
      /* Reverse filter for media */
      img, video, iframe, canvas, svg, picture {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `;
  } else if (theme === 'light') {
    // Light mode CSS with brightness
    cssText = `
      html {
        color-scheme: light !important;
        background-color: white !important;
        color: black !important;
        filter: brightness(${brightness}%) !important;
      }
    `;
  } else {
    // System default, only apply brightness if not 100%
    if (brightness !== 100) {
      cssText = `
        html {
          filter: brightness(${brightness}%) !important;
        }
      `;
    } else {
      // Remove style if no overrides
      if (document.getElementById('force-theme-dynamic-style')) {
        styleEl.remove();
      }
    }
  }

  styleEl.textContent = cssText;
}

const hostname = window.location.hostname;
const storageKey = `themeSettings_${hostname}`;

// Initial apply
chrome.storage.local.get(storageKey, (result) => {
  const settings = result[storageKey] || {};
  const theme = settings.themeOverride || 'system';
  const brightness = settings.brightness !== undefined ? settings.brightness : 100;
  updateStyles(theme, brightness);
});

// Watch for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[storageKey]) {
    const settings = changes[storageKey].newValue || {};
    const theme = settings.themeOverride || 'system';
    const brightness = settings.brightness !== undefined ? settings.brightness : 100;
    updateStyles(theme, brightness);
  }
});
