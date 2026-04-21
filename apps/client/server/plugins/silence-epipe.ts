import { defineNitroPlugin } from "nitropack/runtime";

// Socket write-after-close during dev HMR / SSR stream cancellation.
// Benign — the peer already closed. Swallow EPIPE only; surface everything else.
function isEPipe(err: unknown): boolean {
  const e = err as NodeJS.ErrnoException | undefined;
  return !!e && (e.code === "EPIPE" || /write EPIPE/.test(String(e.message ?? e)));
}

export default defineNitroPlugin(() => {
  process.on("unhandledRejection", (reason) => {
    if (isEPipe(reason)) return;
    throw reason;
  });

  process.on("uncaughtException", (err) => {
    if (isEPipe(err)) return;
    throw err;
  });
});
