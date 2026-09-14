# GongGong

## Hosting

- GitHub Pages serves `docs/` from the `main` branch: https://chihpao.github.io/GongGong/
- The existing protected backend remains at https://gonggong.chihpao.chatgpt.site/api/pages
- Password and decryption key are server secrets (`SITE_PASSWORD`, `VAULT_KEY`), never GitHub Pages files.
- Private text and photos are AES-GCM encrypted in `lib/vault.generated.json`. D1 stores expiring sessions and login rate limits.

## Connection

The Pages frontend posts the password to the backend over HTTPS. A successful check returns a random session token kept only in page memory. Text and images require that token; images become temporary blob URLs. Refreshing requires the password again. Closing revokes the session and clears the page. The backend accepts browser requests only from `https://chihpao.github.io` and verifies every protected read.

## Updates

Edit `docs/index.html`, `docs/style.css`, and `docs/app.js` for the public presentation; push `main` to update Pages automatically. Keep private text and photos out of `docs/`. Private content changes must be encrypted locally with the server key, then build and publish a new backend version. Change passwords through backend runtime secret settings, never frontend code. Backend edits require a separate Sites build and publication; a GitHub push alone updates only Pages.

## Development

Install with `npm run install:ci`, then run `npm run dev`. Configure backend secrets in ignored `.dev.vars`. The site ends at the night photograph, with no closing letter.
