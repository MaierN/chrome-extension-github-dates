const LOCALE = "en-CH";

const UNITS = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};
const RTF = new Intl.RelativeTimeFormat(LOCALE);

function getRelativeTime(d1, d2 = new Date()) {
  const elapsed = d1 - d2;

  for (const u in UNITS) {
    if (Math.abs(elapsed) > UNITS[u] || u == "second") {
      return RTF.format(Math.round(elapsed / UNITS[u]), u);
    }
  }
}

function replaceDates() {
  const res = document.querySelectorAll("relative-time");
  for (let element of res) {
    const dateIso = element.getAttribute("datetime");

    const date = new Date(dateIso);
    const dateStr = date.toLocaleString("fr-CH", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newElement = document.createElement("span");
    newElement.textContent = dateStr;
    newElement.title = getRelativeTime(date) + "\n" + dateIso;
    newElement.classList = element.classList;
    element.replaceWith(newElement);
  }
}

window.navigation.addEventListener("navigate", (event) => {
  replaceDates();
});

const mutationObserver = new MutationObserver((mutations) => {
  replaceDates();
});
mutationObserver.observe(document.body, {
  subtree: true,
  childList: true,
});

replaceDates();
