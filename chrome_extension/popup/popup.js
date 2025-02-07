const configForm = document.getElementById("configForm");

const configEnabled = document.getElementById("configEnabled");
const configEnabledLabel = document.getElementById("configEnabledLabel");
const configLocale = document.getElementById("configLocale");
const configEnableColors = document.getElementById("configEnableColors");

function forEachTab(cb) {
  chrome.tabs.query(
    {
      url: "*://github.com/*",
    },
    (tabs) => {
      for (let tab of tabs) {
        cb(tab);
      }
    }
  );
}

function reloadTabs() {
  forEachTab((tab) => {
    chrome.tabs.reload(tab.id);
  });
}

function sendToTabs(message) {
  forEachTab((tab) => {
    chrome.tabs.sendMessage(tab.id, message).catch((e) => {
      console.log("sendToTabs error:", e, "when sending", message, "to", tab);
    });
  });
}

function updateConfigTab() {
  sendToTabs({ type: "updateConfig" });
}

function updateEnabledLabel(enabled) {
  const text = enabled ? "Enabled" : "Disabled";
  configEnabledLabel.textContent = text;
}

function updateEnableColorsLabel(enabled) {
  const text = enabled ? "Colors enabled" : "Colors disabled";
  configEnableColorsLabel.textContent = text;
}

chrome.storage.sync.get(
  { locale: "en-CH", enabled: true, enableColors: true },
  (config) => {
    configEnabled.checked = config.enabled;
    updateEnabledLabel(config.enabled);
    configLocale.value = config.locale;
    configEnableColors.checked = config.enableColors;
    updateEnableColorsLabel(config.enableColors);

    configEnabled.addEventListener("input", () => {
      chrome.storage.sync.set({ enabled: configEnabled.checked }).then(() => {
        updateEnabledLabel(configEnabled.checked);
        reloadTabs();
      });
    });
    configLocale.addEventListener("input", () => {
      chrome.storage.sync.set({ locale: configLocale.value }).then(() => {
        updateConfigTab();
      });
    });
    configEnableColors.addEventListener("input", () => {
      chrome.storage.sync
        .set({ enableColors: configEnableColors.checked })
        .then(() => {
          updateEnableColorsLabel(configEnableColors.checked);
          updateConfigTab();
        });
    });

    configForm.style.display = "initial";
  }
);
