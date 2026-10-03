export function syncKeynoteFavicon() {
  if (typeof document === "undefined") {
    return;
  }

  const href = "/logo.png";
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ] as const;
  let touched = false;
  for (const sel of selectors) {
    document.querySelectorAll<HTMLLinkElement>(sel).forEach((link) => {
      link.type = "image/png";
      link.href = href;
      touched = true;
    });
  }

  if (!touched) {
    const link = document.createElement("link");
    link.id = "arcitype-favicon";
    link.rel = "icon";
    link.type = "image/png";
    link.href = href;
    document.head.prepend(link);
  }
}

export const syncKeythmFavicon = syncKeynoteFavicon;
