# GongGong

A responsive visual journal with server-side password verification, encrypted private content, expiring sessions, and login rate limits.

## Development

Install with `npm run install:ci`, then run `npm run dev`.
Configure `SITE_PASSWORD` and `VAULT_KEY` as runtime secrets. Never commit secret files. Private text and images are encrypted in `lib/vault.generated.json`; the decryption key is available only on the server. Public code cannot reveal the content or password.

The site deliberately ends at the final photograph, without a closing letter.
