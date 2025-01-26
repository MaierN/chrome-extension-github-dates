const configForm = document.getElementById("configForm");

const configEnabled = document.getElementById("configEnabled");
const configLocale = document.getElementById("configLocale");

chrome.storage.sync.get({ locale: "en-CH", enabled: true }, (config) => {
  configEnabled.checked = config.enabled;
  configLocale.value = config.locale;

  configEnabled.addEventListener("change", () => {
    chrome.storage.sync.set({ enabled: configEnabled.checked });

    chrome.tabs.query(
      {
        url: "*://github.com/*",
      },
      (tabs) => {
        for (let tab of tabs) {
          chrome.tabs.reload(tab.id);
        }
      }
    );
  });
  configLocale.addEventListener("change", () => {
    chrome.storage.sync.set({ locale: configLocale.value });
  });

  configForm.style.display = "initial";
});
