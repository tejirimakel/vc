// Single source of truth for requesting the soft PWA-access cookie.
// Used by the launch page, the mobile redirect, and the install/open buttons.
export async function requestPwaAccess(intent = 'standalone') {
  const response = await fetch('/api/pwa/access', {
    method: 'POST',
    headers: { 'x-tvc-pwa-launch': intent },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `PWA access failed with ${response.status}`);
  }

  return response;
}
