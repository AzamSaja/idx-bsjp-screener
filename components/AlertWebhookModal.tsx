"use client";

import React, { useState } from "react";
import { BsjpCandidate } from "@/types/screening";
import { X, Bell, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface AlertWebhookModalProps {
  candidates: BsjpCandidate[];
  isOpen: boolean;
  onClose: () => void;
}

export const AlertWebhookModal: React.FC<AlertWebhookModalProps> = ({
  candidates,
  isOpen,
  onClose,
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channel, setChannel] = useState<"discord" | "telegram">("discord");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const topCandidates = candidates.slice(0, 4);

  const handleDispatchAlert = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/alerts/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim() || undefined,
          candidates: topCandidates,
          channel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({
          success: true,
          message: data.message || "Alert webhook successfully triggered!",
        });
      } else {
        setSendResult({
          success: false,
          message: data.error || "Failed to trigger webhook",
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err?.message || "Network error while triggering webhook",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-border bg-surface-200/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              15:45 WIB Late Session Webhook Alerts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-50 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* Scheduled Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded bg-blue-950/30 border border-blue-800 text-blue-300 font-sans text-xs">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <strong>Automated Alert Window:</strong> Triggers daily at <strong>15:45 WIB</strong> before closing auction to send top BSJP momentum candidates.
            </div>
          </div>

          {/* Channel selector */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-sans text-xs">
              Alert Notification Channel:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setChannel("discord")}
                className={`py-1.5 px-3 rounded border text-xs font-semibold ${
                  channel === "discord"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-surface-200 text-slate-300 border-border"
                }`}
              >
                Discord Webhook Embed
              </button>
              <button
                onClick={() => setChannel("telegram")}
                className={`py-1.5 px-3 rounded border text-xs font-semibold ${
                  channel === "telegram"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-surface-200 text-slate-300 border-border"
                }`}
              >
                Telegram Bot Markdown
              </button>
            </div>
          </div>

          {/* Webhook URL Input */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-sans text-xs">
              Webhook URL (optional, defaults to .env DISCORD_WEBHOOK_URL):
            </label>
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#0c0e14] border border-border rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Payload Preview */}
          <div className="bg-surface-200 p-3 rounded-lg border border-border">
            <div className="text-slate-400 text-[11px] mb-2 font-sans font-semibold">
              Live Preview of Top {topCandidates.length} Candidates to Broadcast:
            </div>
            <div className="space-y-1.5">
              {topCandidates.map((c) => (
                <div key={c.stock.ticker} className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-100">
                    🎯 {c.stock.ticker} ({c.stock.changePct > 0 ? "+" : ""}{c.stock.changePct}%)
                  </span>
                  <span className="text-emerald-400">
                    Buy: {c.tradePlan.entryPrice} | TP: {c.tradePlan.targetProfit1}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    {c.bsjpScore}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback message */}
          {sendResult && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                sendResult.success
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                  : "bg-rose-950/40 text-rose-300 border border-rose-800"
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{sendResult.message}</span>
            </div>
          )}

          {/* Dispatch Button */}
          <button
            onClick={handleDispatchAlert}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? "Dispatching Alert..." : "Test Dispatch Webhook Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

