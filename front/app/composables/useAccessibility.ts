/* Composable - Gestion de l'accessibilité et navigation clavier */

export function useKeyboardNavigation() {
  const focusedElementIndex = ref(-1);
  const focusableElements = ref<HTMLElement[]>([]);

  function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
    ].join(", ");

    return Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  function handleKeyboardNavigation(
    event: KeyboardEvent,
    container: HTMLElement
  ) {
    focusableElements.value = getFocusableElements(container);

    if (focusableElements.value.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedElementIndex.value = Math.min(
          focusedElementIndex.value + 1,
          focusableElements.value.length - 1
        );
        focusableElements.value[focusedElementIndex.value]?.focus();
        break;

      case "ArrowUp":
        event.preventDefault();
        focusedElementIndex.value = Math.max(focusedElementIndex.value - 1, 0);
        focusableElements.value[focusedElementIndex.value]?.focus();
        break;

      case "Home":
        event.preventDefault();
        focusedElementIndex.value = 0;
        focusableElements.value[0]?.focus();
        break;

      case "End":
        event.preventDefault();
        focusedElementIndex.value = focusableElements.value.length - 1;
        focusableElements.value[focusedElementIndex.value]?.focus();
        break;

      case "Escape":
        (document.activeElement as HTMLElement)?.blur();
        break;
    }
  }

  return {
    handleKeyboardNavigation,
    focusedElementIndex,
    focusableElements,
  };
}

export function useScreenReaderAnnouncements() {
  const announceElement = ref<HTMLElement | null>(null);

  function announce(
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) {
    if (!announceElement.value) {
      announceElement.value = document.createElement("div");
      announceElement.value.setAttribute("aria-live", priority);
      announceElement.value.setAttribute("aria-atomic", "true");
      announceElement.value.setAttribute("class", "sr-only");
      document.body.appendChild(announceElement.value);
    }

    announceElement.value.textContent = "";
    setTimeout(() => {
      if (announceElement.value) {
        announceElement.value.textContent = message;
      }
    }, 100);
  }

  function announcePageChange(title: string) {
    announce(`Page changée: ${title}`, "assertive");
  }

  function announceError(error: string) {
    announce(`Erreur: ${error}`, "assertive");
  }

  function announceSuccess(message: string) {
    announce(`Succès: ${message}`, "polite");
  }

  return {
    announce,
    announcePageChange,
    announceError,
    announceSuccess,
  };
}

export function useAccessibleColors() {
  function calculateContrast(color1: string, color2: string): number {
    function getLuminance(color: string): number {
      const rgb = hexToRgb(color);
      if (!rgb) return 0;

      const [r = 0, g = 0, b = 0] = [rgb.r, rgb.g, rgb.b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result && result[1] && result[2] && result[3]
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  function isContrastValid(
    foreground: string,
    background: string,
    level: "AA" | "AAA" = "AA"
  ): boolean {
    const contrast = calculateContrast(foreground, background);
    const requiredRatio = level === "AAA" ? 7 : 4.5;
    return contrast >= requiredRatio;
  }

  return {
    calculateContrast,
    isContrastValid,
  };
}

export function useARIALabels() {
  function generateId(prefix = "aria"): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function createInteractiveARIA(options: {
    label: string;
    description?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    role?: string;
  }) {
    const attrs: Record<string, string | boolean> = {
      "aria-label": options.label,
    };

    if (options.description) {
      const descId = generateId("desc");
      attrs["aria-describedby"] = descId;
    }

    if (options.expanded !== undefined) {
      attrs["aria-expanded"] = options.expanded.toString();
    }

    if (options.selected !== undefined) {
      attrs["aria-selected"] = options.selected.toString();
    }

    if (options.disabled) {
      attrs["aria-disabled"] = "true";
    }

    if (options.role) {
      attrs.role = options.role;
    }

    return attrs;
  }

  function createListARIA(options: {
    listLabel: string;
    itemCount: number;
    currentIndex?: number;
  }) {
    return {
      list: {
        role: "listbox",
        "aria-label": options.listLabel,
      },
      item: (index: number) => ({
        role: "option",
        "aria-posinset": index + 1,
        "aria-setsize": options.itemCount,
        "aria-selected": options.currentIndex === index ? "true" : "false",
        tabindex: options.currentIndex === index ? "0" : "-1",
      }),
    };
  }

  return {
    generateId,
    createInteractiveARIA,
    createListARIA,
  };
}

export function useAccessibility() {
  const keyboard = useKeyboardNavigation();
  const announcer = useScreenReaderAnnouncements();
  const colors = useAccessibleColors();
  const aria = useARIALabels();

  function setupAccessibleComponent(container: Ref<HTMLElement | null>) {
    onMounted(() => {
      if (!container.value) return;

      container.value.addEventListener("keydown", (event) => {
        keyboard.handleKeyboardNavigation(event, container.value!);
      });

      const focusableElements = container.value.querySelectorAll(
        "button, a, input, select, textarea, [tabindex]"
      );

      focusableElements.forEach((element) => {
        element.addEventListener("focus", () => {
          element.classList.add("focus-visible");
        });

        element.addEventListener("blur", () => {
          element.classList.remove("focus-visible");
        });
      });
    });
  }

  return {
    keyboard,
    announcer,
    colors,
    aria,
    setupAccessibleComponent,
  };
}

export const commonARIAPatterns = {
  toggleButton: (isExpanded: boolean, label: string) => ({
    "aria-expanded": isExpanded.toString(),
    "aria-label": label,
    role: "button",
    tabindex: "0",
  }),

  navLink: (isCurrent: boolean, label: string) => ({
    "aria-current": isCurrent ? "page" : undefined,
    "aria-label": label,
  }),

  productCard: (name: string, price?: number, rating?: number) => ({
    role: "article",
    tabindex: "0",
    "aria-label": `${name}${price ? `, ${price}€` : ""}${
      rating ? `, noté ${rating}/5` : ""
    }`,
  }),

  formField: (
    label: string,
    error?: string,
    required = false,
    describedBy?: string
  ) => ({
    "aria-label": label,
    "aria-required": required.toString(),
    "aria-invalid": error ? "true" : "false",
    "aria-describedby":
      describedBy || (error ? `error-${Math.random()}` : undefined),
  }),

  modal: (title: string) => ({
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": `modal-title-${Math.random()}`,
    tabindex: "-1",
  }),
};
