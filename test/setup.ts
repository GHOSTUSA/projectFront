/** Configuration des tests unitaires - Mocks et setup global */
import { vi } from "vitest";
import { config } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";

vi.mock("#app", () => ({
  navigateTo: vi.fn(),
  useCookie: vi.fn(() => ({ value: null })),
  useNuxtApp: vi.fn(() => ({
    $i18n: {
      t: (key: string) => key,
      locale: { value: "fr" },
    },
  })),
  useState: vi.fn(() => ({ value: null })),
  useRuntimeConfig: vi.fn(() => ({
    public: { API_BASE_URL: "http://localhost:3000" },
  })),
}));

config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
  }),
];

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});
