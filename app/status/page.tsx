"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LockIcon, ShieldIcon, CheckIcon, AlertIcon } from "@components/Icons";
import type { Metadata } from "next";

const CHECKS = [
  { key: "api",  label: "API",      description: "Secret storage and retrieval" },
  { key: "db",   label: "Database", description: "Encrypted secret store"       },
  { key: "enc",  label: "Crypto",   description: "Client-side encryption"       },
];

type Status = "checking" | "ok" | "degraded" | "down";

export default function StatusPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [checks, setChecks] = useState<Record<string, Status>>({
    api: "checking", db: "checking", enc: "checking",
  });
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const runChecks = async () => {
    setStatus("checking");
    setChecks({ api: "checking", db: "checking", enc: "checking" });

    // Check API + DB via health endpoint
    let apiOk = false;
    let dbOk  = false;
    try {
      const res  = await fetch("/api/health");
      const body = await res.json();
      apiOk = res.ok;
      dbOk  = body.ok === true;
    } catch {
      apiOk = false;
      dbOk  = false;
    }

    // Check Web Crypto API availability
    let encOk = false;
    try {
      const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt"]);
      encOk = !!key;
    } catch {
      encOk = false;
    }

    const next = {
      api: apiOk ? "ok" : "down",
      db:  dbOk  ? "ok" : "down",
      enc: encOk ? "ok" : "down",
    } as Record<string, Status>;

    setChecks(next);
    setCheckedAt(new Date());

    const allOk      = Object.values(next).every((s) => s === "ok");
    const anyDown    = Object.values(next).some((s) => s === "down");
    setStatus(allOk ? "ok" : anyDown ? "down" : "degraded");
  };

  useEffect(() => { runChecks(); }, []);

  const banner = {
    checking: { bg: "bg-surface",      border: "border-border",        text: "text-text-dim",   label: "Checking…"         },
    ok:       { bg: "bg-green-surface", border: "border-green-border",  text: "text-green",      label: "All systems operational" },
    degraded: { bg: "bg-teal-bg",       border: "border-teal-border",   text: "text-teal",       label: "Partial degradation"     },
    down:     { bg: "bg-red-bg",        border: "border-red-border",    text: "text-red",        label: "Service disruption"      },
  }[status];

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

        {/* Banner */}
        <div className={`${banner.bg} border ${banner.border} rounded-2xl p-6 mb-4 flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl border ${banner.border} flex items-center justify-center flex-shrink-0 ${banner.text}`}>
            {status === "ok" ? <CheckIcon s={20} /> : <ShieldIcon s={20} />}
          </div>
          <div>
            <div className={`text-base font-semibold ${banner.text}`}>{banner.label}</div>
            {checkedAt && (
              <div className="text-[12px] text-text-faint mt-[2px]">
                Last checked {checkedAt.toLocaleTimeString()}
              </div>
            )}
          </div>
          <button
            onClick={runChecks}
            className="ml-auto text-xs text-text-faint hover:text-text-dim transition-colors bg-transparent border-none cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {/* Individual checks */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
          {CHECKS.map((check, i) => {
            const s = checks[check.key];
            return (
              <div
                key={check.key}
                className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-[#1a1828]" : ""}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-mid">{check.label}</div>
                  <div className="text-[12px] text-text-faint">{check.description}</div>
                </div>
                <StatusPill status={s} />
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-text-ghost pb-8 space-y-2">
          <div>Checks run live from your browser against the HushLink API.</div>
          <div>
            <Link href="/" className="hover:text-text-faint transition-colors">
              ← Back to HushLink
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    checking: "bg-surface border-border text-text-faint",
    ok:       "bg-green-surface border-green-border text-green",
    degraded: "bg-teal-bg border-teal-border text-teal",
    down:     "bg-red-bg border-red-border text-red",
  };
  const labels: Record<Status, string> = {
    checking: "Checking",
    ok:       "Operational",
    degraded: "Degraded",
    down:     "Down",
  };
  return (
    <span className={`text-[11px] font-medium px-3 py-1 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
