// Fetch Metadata is set by the browser and cannot be set by page JavaScript.
// It establishes the browser-visible origin even when a trusted proxy rewrites Host.
export function isSameOriginRequest(
  headers: Headers,
  internalURL: string,
  config: {
    appOrigin?: string;
    codespace?: string;
    forwardingDomain?: string;
  } = {},
): boolean {
  const origin = headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== origin
    )
      return false;
    const fetchSite = headers.get("sec-fetch-site");
    if (fetchSite === "same-origin") return true;
    // Explicit cross-site/same-site browser traffic must never bypass CSRF checks.
    if (fetchSite) return false;
    const allowed = new Set<string>();
    if (config.appOrigin) allowed.add(new URL(config.appOrigin).origin);
    if (
      config.codespace &&
      config.forwardingDomain &&
      /^[a-z0-9-]+$/i.test(config.codespace) &&
      /^[a-z0-9.-]+$/i.test(config.forwardingDomain)
    )
      allowed.add(
        `https://${config.codespace}-3000.${config.forwardingDomain}`,
      );
    // For non-browser clients without Fetch Metadata, an explicit deployment
    // origin takes precedence over an internal request address.
    if (!allowed.size) {
      const url = new URL(internalURL);
      allowed.add(`${url.protocol}//${headers.get("host") || url.host}`);
    }
    return allowed.has(origin);
  } catch {
    return false;
  }
}
