import Link from "next/link";
import { LockIcon } from "@components/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HushLink",
  description: "How HushLink handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[640px] mx-auto px-6 py-12">

        <div className="flex items-center gap-[10px] mb-10">
          <Link href="/" className="flex items-center gap-[10px] no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-mid to-purple-dark rounded-[8px] flex items-center justify-center text-white">
              <LockIcon s={15} />
            </div>
            <span className="text-lg font-semibold tracking-[-0.5px] text-text-bright">
              hush<span className="text-purple">link</span>
            </span>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 mb-4">
          <h1 className="text-xl font-semibold text-text-bright mb-1">Privacy Policy</h1>
          <p className="text-xs text-text-faint mb-8">Last updated: May 2026</p>

          <Section title="Overview">
            HushLink is a zero-knowledge secret sharing tool. It is built so that we
            cannot read the content you share — your secrets are encrypted in your
            browser before anything reaches our servers. This policy explains the
            limited data we do handle and how we handle it.
          </Section>

          <Section title="Who we are">
            HushLink is operated by Arian Najafi Yamchelo, based in Australia. For
            privacy-related enquiries, contact{" "}
            <a
              href="mailto:privacy@hushlink.app"
              className="text-purple hover:underline"
            >
              privacy@hushlink.app
            </a>
            .
          </Section>

          <Section title="What we collect">
            <SubItem title="IP addresses">
              When you use HushLink, your IP address is used to enforce rate limits
              — a maximum number of requests per minute to prevent abuse. Rate limit
              records are stored in our database with an automatic expiry of
              approximately 2 minutes. We do not log or retain IP addresses beyond
              this.
            </SubItem>
            <SubItem title="Encrypted secrets">
              When you create a secret, the encrypted ciphertext is stored on our
              servers temporarily. We have no ability to read it — the encryption
              key exists only in your browser as a code delivered through a separate
              channel. Secrets are permanently deleted the moment they are opened, or
              automatically expire after the time you selected (between 1 hour and 30
              days).
            </SubItem>
            <SubItem title="Infrastructure logs">
              Our hosting provider (AWS Amplify) and network provider (Cloudflare)
              may retain access logs including IP addresses and request timestamps as
              part of their standard operations. These are governed by their
              respective privacy policies and are outside our direct control.
            </SubItem>
          </Section>

          <Section title="What we do not collect">
            <ul className="list-none space-y-[6px]">
              {[
                "No user accounts or registration",
                "No email addresses",
                "No cookies or tracking pixels",
                "No analytics or behavioural data",
                "No device fingerprinting",
                "No advertising identifiers",
                "No content of your secrets — ever",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-text-dim">
                  <span className="mt-[6px] w-[5px] h-[5px] rounded-full bg-purple opacity-50 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="How we use the data we collect">
            IP addresses are used solely to prevent automated abuse of the service.
            They are not used for profiling, marketing, or any purpose other than
            rate limiting. No personal information is sold or shared with third
            parties for commercial purposes.
          </Section>

          <Section title="Third-party services">
            <SubItem title="Amazon Web Services (AWS)">
              We use AWS DynamoDB to store encrypted secrets and rate limit records,
              and AWS Amplify to host the application. AWS processes data in
              accordance with its privacy policy and may retain infrastructure logs.
            </SubItem>
            <SubItem title="Cloudflare">
              Traffic to HushLink passes through Cloudflare for DNS and DDoS
              protection. Cloudflare may process your IP address and request metadata
              in accordance with its privacy policy.
            </SubItem>
            <SubItem title="Google Fonts">
              HushLink loads fonts from Google Fonts (fonts.googleapis.com). Your
              browser makes a request to Google's servers when loading these fonts.
              To avoid this, you can block fonts.googleapis.com in your browser or
              use a content blocker.
            </SubItem>
          </Section>

          <Section title="Data retention">
            <ul className="list-none space-y-[6px]">
              {[
                "Rate limit records: automatically deleted after ~2 minutes",
                "Encrypted secrets: deleted immediately on first open, or after your chosen expiry (1 hour to 30 days)",
                "Infrastructure logs: retained by AWS and Cloudflare per their policies",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-text-dim">
                  <span className="mt-[6px] w-[5px] h-[5px] rounded-full bg-purple opacity-50 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Your rights">
            Under the Australian Privacy Act 1988 and the Australian Privacy
            Principles (APPs), you have the right to request access to personal
            information we hold about you and to request corrections. Given the
            minimal data we retain and its short lifespan, there is typically nothing
            to access by the time a request is made.
            <br /><br />
            If you are located in the European Economic Area, you may also have
            rights under the GDPR including the right to erasure and the right to
            data portability. Contact us at{" "}
            <a href="mailto:privacy@hushlink.app" className="text-purple hover:underline">
              privacy@hushlink.app
            </a>{" "}
            to exercise any of these rights.
          </Section>

          <Section title="Security">
            All secrets are encrypted using AES-256-GCM in your browser before
            transmission. The server never receives or stores a decryption key. All
            connections are encrypted via HTTPS with HTTP Strict Transport Security
            (HSTS) enforced. We take reasonable technical measures to secure the
            infrastructure, but no system is completely immune to risk.
          </Section>

          <Section title="Changes to this policy">
            We may update this policy from time to time. Changes will be reflected
            by the updated date at the top of this page. Continued use of HushLink
            after changes constitutes acceptance of the updated policy.
          </Section>

          <Section title="Governing law" last>
            This policy is governed by the laws of Australia. Disputes are subject
            to the jurisdiction of the courts of Australia.
          </Section>
        </div>

        <div className="text-center text-xs text-text-ghost pb-8">
          <Link href="/" className="hover:text-text-faint transition-colors">
            ← Back to HushLink
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`${!last ? "border-b border-[#1a1828] pb-6 mb-6" : ""}`}>
      <h2 className="text-sm font-semibold text-text-mid mb-3">{title}</h2>
      <div className="text-[13px] text-text-dim leading-[1.75]">{children}</div>
    </div>
  );
}

function SubItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <span className="text-[13px] font-medium text-text-mid">{title} — </span>
      <span className="text-[13px] text-text-dim leading-[1.75]">{children}</span>
    </div>
  );
}
