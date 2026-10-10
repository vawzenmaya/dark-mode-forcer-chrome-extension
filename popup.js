document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('theme-select');
  const brightnessSlider = document.getElementById('brightness-slider');
  const brightnessValue = document.getElementById('brightness-value');
  const footerInfo = document.getElementById('footer-info');

  // Get current active tab hostname
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
    footerInfo.textContent = 'Cannot apply to this page';
    select.disabled = true;
    brightnessSlider.disabled = true;
    return;
  }

  const url = new URL(tab.url);
  const hostname = url.hostname;
  const storageKey = `themeSettings_${hostname}`;

  footerInfo.textContent = `Applies to: ${hostname}`;

  // Load current settings for this hostname
  const result = await chrome.storage.local.get(storageKey);
  const settings = result[storageKey] || { themeOverride: 'system', brightness: 100 };
  
  select.value = settings.themeOverride;
  brightnessSlider.value = settings.brightness;
  brightnessValue.textContent = `${settings.brightness}%`;

  // Save theme on change
  select.addEventListener('change', async (e) => {
    const value = e.target.value;
    const currentResult = await chrome.storage.local.get(storageKey);
    const currentSettings = currentResult[storageKey] || { brightness: 100 };
    await chrome.storage.local.set({ 
      [storageKey]: { ...currentSettings, themeOverride: value } 
    });
  });

  // Save brightness on input (real-time feedback)
  brightnessSlider.addEventListener('input', async (e) => {
    const val = e.target.value;
    brightnessValue.textContent = `${val}%`;
    const currentResult = await chrome.storage.local.get(storageKey);
    const currentSettings = currentResult[storageKey] || { themeOverride: 'system' };
    await chrome.storage.local.set({ 
      [storageKey]: { ...currentSettings, brightness: parseInt(val, 10) } 
    });
  });
});
