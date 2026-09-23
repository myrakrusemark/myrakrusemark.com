// The public article uses a bounded Cloudflare relay for its hosted Jev step.
// Browser embeddings, Qwen and speech never depend on this endpoint.
export const PUBLIC_JEV_ENDPOINT = 'https://jev-support-proxy.myrakrusemark.workers.dev/decide';
export function jevEndpoint(origin = globalThis.location?.origin) {
  return ['http://127.0.0.1:8383','http://localhost:8383'].includes(origin)
    ? 'http://127.0.0.1:8392/decide' // explicitly local Wrangler development environment
    : PUBLIC_JEV_ENDPOINT;
}
