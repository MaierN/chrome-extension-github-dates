const EXT_TOKEN = "chrome-extension-github-dates";

const UNITS = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const COLOR_NEAR = 7 * UNITS.day;
const COLOR_FAR_START = UNITS.year / 2;
const COLOR_FAR_END = UNITS.year;

const BASE_HUE = 211.43;
const BASE_SATURATION = 10.55;
const BASE_LIGHTNESS = 39.02;
const MAX_SATURATION = 50;
const HUE_RECENT = 120;
const HUE_OLD = 0;

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

function mapRange(inMin, inMax, outMin, outMax, value) {
  const alpha = (value - inMin) / (inMax - inMin);
  const mapped = alpha * (outMax - outMin) + outMin;
  if (outMax < outMin) {
    const tmp = outMax;
    outMax = outMin;
    outMin = tmp;
  }
  const clamped = Math.max(outMin, Math.min(outMax, mapped));
  return clamped;
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
    const now = new Date();

    const newElement = document.createElement("span");

    newElement.setAttribute("datetime", dateIso);
    newElement.textContent = dateStr;
    newElement.title = getRelativeTime(date, now) + "\n" + dateIso;

    newElement.classList = element.classList;
    if (!newElement.classList.contains(EXT_TOKEN)) {
      newElement.classList.add(EXT_TOKEN);
    }
    newElement.style.whiteSpace = "nowrap";

    if (config.enableColors) {
      const elapsedMs = now - date;

      let hue = BASE_HUE;
      let saturation = BASE_SATURATION;
      let lightness = BASE_LIGHTNESS;

      if (elapsedMs < COLOR_NEAR) {
        hue = HUE_RECENT;
        saturation = mapRange(
          0,
          COLOR_NEAR,
          MAX_SATURATION,
          BASE_SATURATION,
          elapsedMs
        );
      } else if (elapsedMs > COLOR_FAR_START) {
        hue = HUE_OLD;
        saturation = mapRange(
          COLOR_FAR_START,
          COLOR_FAR_END,
          BASE_SATURATION,
          MAX_SATURATION,
          elapsedMs
        );
      }

      newElement.style.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

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
    DEFAULT_CONFIG,
    (c) => {
      config = c;
      try {
        rtf = new Intl.RelativeTimeFormat(config.locale);
      } catch (e) {
        console.log(`${EXT_TOKEN}: fallback to ${DEFAULT_CONFIG.locale}`);
        config.locale = DEFAULT_CONFIG.locale;
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
