import React, { useState } from "react";
import { Bug, ImagePlus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../services/api";

export default function ReportBugView() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setStatus(null);
    try {
      let imageData = "";
      if (image)
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      await api.sendBugReport({
        message: message.trim(),
        imageData,
        imageName: image?.name || "screenshot.png",
      });
      setMessage("");
      setImage(null);
      setStatus({ ok: true, text: "Your report was sent successfully." });
    } catch (error) {
      setStatus({
        ok: false,
        text: error.message || "Report delivery failed.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-[28px] border border-red-400/20 bg-[#0c0c12]/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-400/20 grid place-items-center">
            <Bug className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Report a bug</h2>
            <p className="text-xs text-zinc-400">
              Describe the problem and attach a screenshot. The report is
              delivered to your configured webhook.
            </p>
          </div>
        </div>
        {status && (
          <div
            className={`mt-5 flex items-center gap-2 rounded-xl border p-3 text-xs ${status.ok ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300" : "border-red-400/20 bg-red-500/10 text-red-300"}`}
          >
            {status.ok ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {status.text}
          </div>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Explain what happened, what you expected, and how to reproduce it..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white outline-none transition focus:border-red-400/40"
          />
          <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[.025] p-4 text-xs text-zinc-300 transition hover:border-red-400/30 hover:bg-red-400/[.035]">
            <ImagePlus className="w-5 h-5 text-red-300" />
            {image ? image.name : "Attach screenshot (PNG, JPG, WEBP or GIF)"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
          <div className="flex justify-end">
            <button
              disabled={sending || !message.trim()}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
