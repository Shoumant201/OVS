import "server-only"

export type Locale = "en" | "ne"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ne: () => import("./dictionaries/ne.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale | string) => {
  // Default to 'en' if the locale is not supported
  const validLocale = locale in dictionaries ? (locale as Locale) : "en"
  return dictionaries[validLocale]()
}
