/**
 * Optional email notification using Resend (https://resend.com), which has a free tier.
 * It only runs if RESEND_API_KEY and NOTIFY_EMAIL_TO are set. The return value is honest:
 *  - "sent":     Resend accepted the message
 *  - "disabled": email is not configured (the inquiry is still saved in the database)
 *  - "failed":   Resend rejected it or was unreachable (the inquiry is still saved)
 * Note: with Resend's shared sender (onboarding@resend.dev) you can only email the address you signed up with.
 */
export type NotifyResult = "sent" | "disabled" | "failed";

export async function notifyOwner(subject: string, lines: Record<string, string>): Promise<NotifyResult> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) return "disabled";
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html =
    `<div style="font-family:system-ui,sans-serif"><h2>${esc(subject)}</h2><table cellpadding="6">` +
    Object.entries(lines).map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("") +
    `</table></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_EMAIL_FROM || "SA SPORTS <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
