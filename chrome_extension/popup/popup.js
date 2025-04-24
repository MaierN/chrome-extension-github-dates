const configForm = document.getElementById("configForm");

const configEnabled = document.getElementById("configEnabled");
const configEnabledLabel = document.getElementById("configEnabledLabel");
const configLocale = document.getElementById("configLocale");
const configEnableColors = document.getElementById("configEnableColors");
const configGreenThreshold = document.getElementById("configGreenThreshold");
const configGrayThreshold = document.getElementById("configGrayThreshold");

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

  const colorConfigStyle = enabled ? "display: block;" : "display: none;";
  configGreenThreshold.parentElement.style = colorConfigStyle;
  configGrayThreshold.parentElement.style = colorConfigStyle;
}

chrome.storage.sync.get(
  DEFAULT_CONFIG, // set in config.js
  (config) => {
    configEnabled.checked = config.enabled;
    updateEnabledLabel(config.enabled);
    configLocale.value = config.locale;
    configEnableColors.checked = config.enableColors;
    updateEnableColorsLabel(config.enableColors);
    configGreenThreshold.value = config.greenThreshold;
    configGrayThreshold.value = config.grayThreshold;

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
    configGreenThreshold.addEventListener("input", () => {
      chrome.storage.sync
        .set({ greenThreshold: parseInt(configGreenThreshold.value) })
        .then(() => {
          updateConfigTab();
        });
    });
    configGrayThreshold.addEventListener("input", () => {
      chrome.storage.sync
        .set({ grayThreshold: parseInt(configGrayThreshold.value) })
        .then(() => {
          updateConfigTab();
        });
    });

    configForm.style.display = "initial";
  }
);
