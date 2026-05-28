import Link from "next/link";
import { LockIcon } from "@components/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — HushLink",
  description: "Terms and conditions for using HushLink.",
};

export default function TermsPage() {
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
          <h1 className="text-xl font-semibold text-text-bright mb-1">Terms of Use</h1>
          <p className="text-xs text-text-faint mb-8">Last updated: May 2026</p>

          <Section title="Acceptance">
            By using HushLink at hushlink.app, you agree to these terms. If you do
            not agree, do not use the service.
          </Section>

          <Section title="What HushLink is">
            HushLink is a free tool for sharing end-to-end encrypted, one-time
            secrets. It is operated by Arian Najafi Yamchelo, an individual based in
            Australia. It is not a commercial data storage service, a communication
            platform, or a security product with any guaranteed service level.
          </Section>

          <Section title="Acceptable use">
            You agree to use HushLink only for lawful purposes. You must not use the
            service to:
            <ul className="list-none space-y-[6px] mt-3">
              {[
                "Store, transmit, or share content that is illegal under Australian law or the laws of your jurisdiction",
                "Distribute malware, exploit code, or material designed to cause harm",
                "Attempt to circumvent rate limits, enumerate secret IDs, or interfere with the service",
                "Use the service on behalf of others to facilitate unlawful activity",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-text-dim">
                  <span className="mt-[6px] w-[5px] h-[5px] rounded-full bg-purple opacity-50 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="No warranty">
            HushLink is provided as-is, without warranty of any kind. We do not
            guarantee that the service will be available at all times, free of bugs,
            or that it will meet your security requirements for any specific use
            case. Encryption is only as strong as the devices and channels you use
            alongside it.
            <br /><br />
            Nothing in these terms excludes any guarantee, right, or remedy that
            cannot be excluded under the Australian Consumer Law.
          </Section>

          <Section title="Limitation of liability">
            To the maximum extent permitted by law, Arian Najafi Yamchelo is not
            liable for any loss or damage arising from your use of HushLink,
            including but not limited to loss of data, loss of confidential
            information, or any indirect or consequential loss.
            <br /><br />
            You are responsible for choosing appropriate channels to transmit the
            link and code, and for the security of your own devices. HushLink
            encrypts your content but cannot protect against a compromised device,
            malicious browser extensions, or interception of the separate code
            channel.
          </Section>

          <Section title="Zero-knowledge limitation">
            Because HushLink is zero-knowledge by design, we have no ability to
            recover a secret, extend an expiry, or reverse a deletion on your
            behalf. Once a secret is opened or expires, it is permanently gone. We
            cannot assist with recovery under any circumstances.
          </Section>

          <Section title="Availability">
            We may modify, suspend, or discontinue HushLink at any time without
            notice. We are not liable for any consequences of unavailability or
            changes to the service.
          </Section>

          <Section title="Intellectual property">
            HushLink is open source software, released under the MIT licence. You
            are free to inspect, fork, and self-host the code in accordance with
            that licence.
          </Section>

          <Section title="Changes to these terms">
            We may update these terms at any time. The updated date at the top of
            this page reflects the most recent revision. Continued use of HushLink
            after changes constitutes acceptance of the updated terms.
          </Section>

          <Section title="Contact">
            For questions about these terms, contact{" "}
            <a href="mailto:legal@hushlink.app" className="text-purple hover:underline">
              legal@hushlink.app
            </a>
            .
          </Section>

          <Section title="Governing law" last>
            These terms are governed by the laws of Australia. Any disputes arising
            from these terms or your use of HushLink are subject to the exclusive
            jurisdiction of the courts of Australia.
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
