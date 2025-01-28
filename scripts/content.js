const DEFAULT_LOCALE = "en-CH";
const EXT_TOKEN = "chrome-extension-github-dates";

const UNITS = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

let config;
let rtf;

function getRelativeTime(d1, d2 = new Date()) {
  const elapsed = d1 - d2;

  for (const u in UNITS) {
    if (Math.abs(elapsed) > UNITS[u] || u == "second") {
      return rtf.format(Math.round(elapsed / UNITS[u]), u);
    }
  }
}

function replaceDates(elements) {
  for (let element of elements) {
    const dateIso = element.getAttribute("datetime");

    const date = new Date(dateIso);
    const dateStr = date.toLocaleString(config.locale, {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newElement = document.createElement("span");
    newElement.setAttribute("datetime", dateIso);
    newElement.textContent = dateStr;
    newElement.title = getRelativeTime(date) + "\n" + dateIso;
    newElement.classList = element.classList;
    if (!newElement.classList.contains(EXT_TOKEN)) {
      newElement.classList.add(EXT_TOKEN);
    }
    newElement.style.whiteSpace = "nowrap";
    element.replaceWith(newElement);
  }
}

function replaceDatesOrig() {
  const res = document.querySelectorAll("relative-time");
  replaceDates(res);
}

function updateDates() {
  const res = document.querySelectorAll(`.${EXT_TOKEN}`);
  replaceDates(res);
}

function init() {
  window.navigation.addEventListener("navigate", (event) => {
    replaceDatesOrig();
  });

  const mutationObserver = new MutationObserver((mutations) => {
    replaceDatesOrig();
  });
  mutationObserver.observe(document.body, {
    subtree: true,
    childList: true,
  });

  replaceDatesOrig();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "updateConfig") {
      readConfig(() => {
        updateDates();
      });
    }
  });
}

function readConfig(cb) {
  chrome.storage.sync.get(
    { enabled: true, locale: DEFAULT_LOCALE, enableColors: true },
    (c) => {
      config = c;
      try {
        rtf = new Intl.RelativeTimeFormat(config.locale);
      } catch (e) {
        console.log(`${EXT_TOKEN}: fallback to ${DEFAULT_LOCALE}`);
        config.locale = DEFAULT_LOCALE;
        rtf = new Intl.RelativeTimeFormat(config.locale);
      }

      if (cb) {
        cb();
      }
    }
  );
}

readConfig(() => {
  if (config.enabled) {
    init();
  }
});
