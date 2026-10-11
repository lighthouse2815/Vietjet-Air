import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import vi from "./locales/vi.json";
const selected = localStorage.getItem("demo-language");
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: selected === "en" ? "en" : "vi", fallbackLng: "vi",
  keySeparator: false, nsSeparator: false, interpolation: { escapeValue: false },
  initAsync: false,
});
i18n.on("languageChanged", language => {
  localStorage.setItem("demo-language", language); document.documentElement.lang = language;
});
document.documentElement.lang = i18n.language;
// Captions may contain spaces around adjacent React elements; preserve them.
const originalKeys = new Map(Object.entries(en).map(([key,value]) => [value,key]));
export function t(value, options = {}) {
  if (typeof value !== "string" || !value.trim()) return value;
  const key = value.trim();
  const source = originalKeys.get(key) || key;
  const translated = i18n.t(source, { defaultValue: source, ...options });
  return value.slice(0,value.indexOf(key)) + translated + value.slice(value.indexOf(key)+key.length);
}
export default i18n;
