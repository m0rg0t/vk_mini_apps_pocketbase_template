/// <reference types="vitest/globals" />

declare global {
  namespace NodeJS {
    interface Global {
      vkBridge: unknown;
    }
  }
}

export {};
