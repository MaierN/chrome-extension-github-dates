const configForm = document.getElementById("configForm");

const configEnabled = document.getElementById("configEnabled");
const configLocale = document.getElementById("configLocale");

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

chrome.storage.sync.get({ locale: "en-CH", enabled: true }, (config) => {
  configEnabled.checked = config.enabled;
  configLocale.value = config.locale;

  configEnabled.addEventListener("input", () => {
    chrome.storage.sync.set({ enabled: configEnabled.checked }).then(() => {
      reloadTabs();
    });
  });
  configLocale.addEventListener("input", () => {
    chrome.storage.sync.set({ locale: configLocale.value }).then(() => {
      sendToTabs({ type: "updateConfig" });
    });
  });

  configForm.style.display = "initial";
});
