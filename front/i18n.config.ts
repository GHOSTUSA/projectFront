export default defineI18nConfig(() => ({
  legacy: false,
  locale: "fr",
  fallbackLocale: "fr",
  numberFormats: {
    fr: {
      currency: {
        style: "currency",
        currency: "EUR",
        notation: "standard",
      },
      decimal: {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      percent: {
        style: "percent",
        useGrouping: false,
      },
    },
    en: {
      currency: {
        style: "currency",
        currency: "EUR",
        notation: "standard",
      },
      decimal: {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      percent: {
        style: "percent",
        useGrouping: false,
      },
    },
  },
  datetimeFormats: {
    fr: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
      },
    },
    en: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
      },
    },
  },
  pluralRules: {
    fr: (choice: number) => {
      if (choice === 0 || choice === 1) {
        return 0;
      }
      return 1;
    },
    en: (choice: number) => {
      if (choice === 1) {
        return 0;
      }
      return 1;
    },
  },
}));
