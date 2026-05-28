import type { Metadata } from "next";
import { headers } from "next/headers";
import "@styles/app.css";

export const metadata: Metadata = {
  title: "HushLink — Share secrets that self-destruct",
  description:
    "Send passwords, API keys, and sensitive notes through a one-time link. Encrypted in your browser. Deleted the moment it's opened. No accounts.",
  keywords: [
    "secure secret sharing",
    "one-time link",
    "encrypted message",
    "self-destructing message",
    "share password securely",
    "zero knowledge",
    "end-to-end encryption",
  ],
  authors: [{ name: "Arian Najafi Yamchelo", url: "https://arii.dev" }],
  metadataBase: new URL("https://hushlink.app"),
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: "https://hushlink.app",
    title: "HushLink — Share secrets that self-destruct",
    description:
      "Send passwords, API keys, and sensitive notes through a one-time link. Encrypted in your browser. Deleted the moment it's opened.",
    siteName: "HushLink",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "HushLink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HushLink — Share secrets that self-destruct",
    description:
      "Send passwords, API keys, and sensitive notes through a one-time link. Encrypted in your browser. Deleted the moment it's opened.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// Async + headers() call opts out of static rendering so Next.js issues a
// fresh nonce (set by proxy.ts) on every request. Without this, a cached
// render would embed a stale nonce that no longer matches the CSP header.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await headers();
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "HushLink",
              url: "https://hushlink.app",
              description:
                "Share passwords, API keys, and sensitive notes through a one-time encrypted link. Deleted the moment it's opened.",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              author: {
                "@type": "Person",
                name: "Arian Najafi Yamchelo",
                url: "https://arii.dev",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
