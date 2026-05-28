import {
  LockIcon,
  FireIcon,
  KeyIcon,
  ShieldIcon,
  TimerIcon,
} from "@components/Icons";
import { EXPIRY_OPTIONS } from "@lib/constants";
import type { ShareResult } from "@components/ShareView";

type Props = { result: ShareResult; onReset: () => void };

export default function ResultView({ result, onReset }: Props) {
  const expiryLabel =
    EXPIRY_OPTIONS.find((o) => o.seconds === result.expiry)?.label || "";
  return (
    <div className="bg-surface-dark border border-border-purple rounded-2xl p-7 mb-4 animate-fade-up">
      <div className="text-center mb-5">
        <div className="w-[52px] h-[52px] mx-auto mb-3 bg-gradient-to-br from-purple-mid to-purple-deep rounded-[14px] flex items-center justify-center text-white">
          <ShieldIcon s={22} />
        </div>
        <div className="text-[17px] font-medium text-text-bright mb-1">
          Secret is live
        </div>
        <div className="text-[13px] text-text-dim">
          Link and code delivered separately. Maximum security active.
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-4">
        <div className="inline-flex items-center gap-[5px] px-[10px] py-[5px] bg-[#1a1828] border border-border-mid rounded-full text-xs text-text-dim">
          <FireIcon s={12} />
          Deleted on first open
        </div>
        <div className="inline-flex items-center gap-[5px] px-[10px] py-[5px] bg-[#1a1828] border border-border-mid rounded-full text-xs text-text-dim">
          <LockIcon s={12} />
          AES-256-GCM
        </div>
        <div className="inline-flex items-center gap-[5px] px-[10px] py-[5px] bg-[#1a1828] border border-border-mid rounded-full text-xs text-text-dim">
          <TimerIcon s={12} />
          Expires in {expiryLabel}
        </div>
        <div className="inline-flex items-center gap-[5px] px-[10px] py-[5px] bg-[#1a1828] border border-border-mid rounded-full text-xs text-text-dim">
          <KeyIcon s={12} />
          Two-channel delivery
        </div>
        {result.passwordProtected && (
          <div className="inline-flex items-center gap-[5px] px-[10px] py-[5px] bg-[#1a1828] border border-purple-subtle rounded-full text-xs text-purple">
            <LockIcon s={12} />
            Password protected
          </div>
        )}
      </div>
      <button
        onClick={onReset}
        className="w-full py-3 bg-transparent border border-border-mid rounded-[10px] text-text-muted text-[13px] cursor-pointer mt-5 hover:border-text-faint hover:text-text-mid transition-colors"
      >
        Create another link
      </button>
    </div>
  );
}
