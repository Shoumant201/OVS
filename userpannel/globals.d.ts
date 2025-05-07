// globals.d.ts or in a types.d.ts
export {}

declare global {
  interface Window {
    __NEXT_LOCALE: string
  }
}
