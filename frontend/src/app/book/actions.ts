"use server";

import nodemailer from "nodemailer";

export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Field, string>>;
};

type Field = "name" | "email" | "company" | "message";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_FILL_MS = 3000; // real people take longer than this to fill the form

const TO = process.env.BOOKING_TO ?? "admin@exaflair.com";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/** Validates the booking form and emails it to the audits inbox. */
export async function requestCall(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const get = (k: Field) => String(formData.get(k) ?? "").trim();
  const values = {
    name: get("name"),
    email: get("email"),
    company: get("company"),
    message: get("message"),
  };

  // Bots: filled the hidden field, or submitted faster than a person could. Pretend it worked.
  const startedAt = Number(formData.get("startedAt") ?? 0);
  if (String(formData.get("fax") ?? "") !== "" || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "success" };
  }

  const errors: BookingState["errors"] = {};
  if (values.name.length < 2) errors.name = "Tell us your name.";
  if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email so we can reply.";
  if (values.company.length < 2) errors.company = "Tell us your company name.";
  if (values.message.length < 10) errors.message = "A sentence or two about the project helps us prepare.";
  for (const [k, v] of Object.entries(values)) {
    if (v.length > (k === "message" ? 5000 : 300)) errors[k as Field] = "That's too long.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", errors, values };
  }

  const mailer = transport();
  if (!mailer) {
    console.error("[book] SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.");
    return {
      status: "error",
      message: `We couldn't send your request right now. Please email us at ${TO}.`,
      values,
    };
  }

  const rows: [string, string][] = [
    ["Name", values.name],
    ["Email", values.email],
    ["Company", values.company],
  ];
  const filled = rows.filter(([, v]) => v);
  const text = [...filled.map(([k, v]) => `${k}: ${v}`), "", values.message].join("\n");
  const html = `
    <h2 style="font-family:sans-serif">New message from the audits site</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${filled
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 16px 4px 0;color:#6b6560">${k}</td><td style="padding:4px 0">${escape(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escape(values.message)}</p>`;

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM ?? `Exaflair Audits <${process.env.SMTP_USER}>`,
      to: TO,
      replyTo: `${values.name.replace(/[\r\n<>"]/g, "")} <${values.email}>`,
      subject: `New enquiry: ${values.name} (${values.company})`.replace(/[\r\n]/g, " "),
      text,
      html,
    });
  } catch (err) {
    console.error("[book] could not send booking email:", err);
    return {
      status: "error",
      message: `We couldn't send your request right now. Please try again, or email us at ${TO}.`,
      values,
    };
  }

  return { status: "success" };
}
