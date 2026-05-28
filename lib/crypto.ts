export type EncryptedPayload = {
  data: string;
  iv: string;
  salt: string;
  passwordProtected: boolean;
  pwSalt?: string;
  pwIv?: string;
  wrappedKey?: string;
};

// Chunked to avoid stack overflow on large payloads (spread has a call-stack
// argument limit; secrets can be up to 64 KB of ciphertext).
const b64 = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(s);
};
const unb64 = (s: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(
  code: string,
  salt: Uint8Array<ArrayBuffer>,
  extractable = false,
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    extractable,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(
  text: string,
  code: string,
  password: string | null,
): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(code, salt, !!password);

  if (password) {
    const pwSalt = crypto.getRandomValues(new Uint8Array(32));
    const pwIv = crypto.getRandomValues(new Uint8Array(12));
    const pwBase = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    const pwKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: pwSalt, iterations: 310000, hash: "SHA-256" },
      pwBase,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const wrappedKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: pwIv },
      pwKey,
      rawKey,
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(text),
    );
    return {
      data: b64(ciphertext),
      iv: b64(iv.buffer),
      salt: b64(salt.buffer),
      pwSalt: b64(pwSalt.buffer),
      pwIv: b64(pwIv.buffer),
      wrappedKey: b64(wrappedKey),
      passwordProtected: true,
    };
  }

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );
  return {
    data: b64(ciphertext),
    iv: b64(iv.buffer),
    salt: b64(salt.buffer),
    passwordProtected: false,
  };
}

export async function decryptSecret(
  payload: EncryptedPayload,
  code: string,
  password: string | null,
): Promise<string> {
  const salt = unb64(payload.salt);
  const iv = unb64(payload.iv);
  const data = unb64(payload.data);

  if (payload.passwordProtected) {
    if (!password) throw new Error("PASSWORD_REQUIRED");
    const pwSalt = unb64(payload.pwSalt!);
    const pwIv = unb64(payload.pwIv!);
    const pwBase = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    const pwKey = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: pwSalt, iterations: 310000, hash: "SHA-256" },
      pwBase,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const rawKey = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: pwIv },
      pwKey,
      unb64(payload.wrappedKey!),
    );
    const key = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(dec);
  }

  const key = await deriveKey(code, salt);
  const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(dec);
}
