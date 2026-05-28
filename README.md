# HushLink

Share a secret with someone. The link works once. The message is gone the moment it's opened.

**[hushlink.app](https://hushlink.app)** · Built by [Arian Najafi Yamchelo](https://arii.dev)

---

## What it does

You paste a secret — a password, an API key, a private note — and HushLink gives you a link and a separate code. You send them through different channels. The recipient enters the code, the secret decrypts in their browser, and it's permanently deleted from the server. No second chances, no history, no trace.

## How it works

- **Encrypted in your browser.** The secret is locked with AES-256-GCM before it ever leaves your device. The server only holds ciphertext it cannot read.
- **Code travels separately.** The link and the decryption code are shown in separate steps and must be sent through different channels. Intercepting one gets you nothing.
- **Deleted on open.** The moment the reveal page loads, the encrypted blob is permanently deleted from the database. Anyone who tries the link after that finds nothing.
- **30-second wipe timer.** After decryption the plaintext is visible for 30 seconds, then cleared from the page and all memory.
- **Optional password.** A third factor wraps the key with PBKDF2 at 310,000 iterations. Three separate factors: link, code, password.
- **Clipboard auto-clears.** Copying the secret starts a 60-second countdown, after which the clipboard is wiped automatically.
- **Rate limited.** The API enforces per-IP limits — 10 creates and 20 fetches per minute — making enumeration and brute-force impractical.
- **No accounts, no logs.** Nothing is stored about who sent what to whom.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | AWS DynamoDB (atomic delete, TTL) |
| Encryption | Web Crypto API — AES-256-GCM + PBKDF2 |
| Hosting | AWS Amplify |

## License

MIT © Arian Najafi Yamchelo — see [LICENSE](LICENSE).
