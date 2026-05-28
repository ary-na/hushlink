import Link from "next/link";
import { LockIcon, AlertIcon } from "@components/Icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — HushLink",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <Link href="/" className="inline-flex items-center gap-[10px] mb-10 no-underline">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-mid to-purple-dark rounded-[8px] flex items-center justify-center text-white">
            <LockIcon s={15} />
          </div>
          <span className="text-lg font-semibold tracking-[-0.5px] text-text-bright">
            hush<span className="text-purple">link</span>
          </span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-14 h-14 mx-auto mb-5 bg-[#1a1828] border border-border-mid rounded-2xl flex items-center justify-center text-text-faint">
            <AlertIcon s={24} />
          </div>
          <div className="text-4xl font-semibold text-text-bright mb-2">404</div>
          <div className="text-sm font-medium text-text-mid mb-2">Page not found</div>
          <div className="text-[13px] text-text-dim leading-[1.7] mb-7">
            If you were trying to open a secret link, it may have already been
            read, expired, or the link may be incomplete.
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-[13px] bg-gradient-to-br from-purple-mid to-purple-deep rounded-[10px] text-white text-sm font-medium transition-all duration-200 hover:opacity-90 no-underline"
          >
            <LockIcon s={15} />
            Go to HushLink
          </Link>
        </div>
      </div>
    </div>
  );
}
