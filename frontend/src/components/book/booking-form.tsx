"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { requestCall, type BookingState } from "@/app/book/actions";

const initialState: BookingState = { status: "idle" };

const inputCls =
  "w-full rounded-lg border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-flame focus:ring-4 focus:ring-flame/10";

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[14px] text-ink/80">
        {label} <span className="text-sev-c">*</span>
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[13px] text-sev-c">
          {error}
        </p>
      )}
    </div>
  );
}

/** Contact form. Posts to a server action that emails the message to the audits inbox. */
export function BookingForm() {
  const [state, formAction, pending] = useActionState(requestCall, initialState);
  const startedAt = useRef<HTMLInputElement>(null);
  const v = state.values ?? {};
  const err = state.errors ?? {};

  // Set on the client so bots that post instantly can be told apart from people.
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);

  const border = (k: keyof typeof err) => (err[k] ? "border-sev-c/60" : "border-line");
  const aria = (k: keyof typeof err) =>
    err[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {};

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === "success" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-12 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-ok/10 text-ok"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
          <h2 className="mt-6 font-semibold tracking-tight text-3xl">Message sent.</h2>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink/65">
            Thanks for reaching out. We&apos;ll reply by email to set up a time for the call.
          </p>
          <Link href="/portfolio" className="mt-8 text-[15px] text-ink underline-offset-4 hover:underline">
            Browse past audits →
          </Link>
        </motion.div>
      ) : (
        <motion.form key="form" action={formAction} initial={false} className="space-y-5" noValidate>
          <h2 className="font-semibold tracking-tight text-3xl">Send us a message</h2>

          {/* spam traps: hidden field bots fill in, and the time the form was opened */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Fax
              <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <input ref={startedAt} type="hidden" name="startedAt" defaultValue="0" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="name" error={err.name}>
              <input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                required
                defaultValue={v.name}
                className={`${inputCls} ${border("name")}`}
                {...aria("name")}
              />
            </Field>
            <Field label="Email address" name="email" error={err.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                required
                defaultValue={v.email}
                className={`${inputCls} ${border("email")}`}
                {...aria("email")}
              />
            </Field>
          </div>

          <Field label="Company name" name="company" error={err.company}>
            <input
              id="company"
              name="company"
              autoComplete="organization"
              placeholder="Your company"
              required
              defaultValue={v.company}
              className={`${inputCls} ${border("company")}`}
              {...aria("company")}
            />
          </Field>

          <Field label="Message" name="message" error={err.message}>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Tell us about your project or inquiry..."
              defaultValue={v.message}
              className={`${inputCls} ${border("message")} resize-y`}
              {...aria("message")}
            />
          </Field>

          <p className="text-[13px] text-ink/45">
            <span className="text-sev-c">*</span> Required fields
          </p>

          {state.status === "error" && state.message && (
            <p role="alert" className="rounded-lg bg-sev-c/[0.06] px-4 py-3 text-[14px] text-sev-c">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-coal px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-flame disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending...
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
                  <path d="M14.5 1.5 7 9M14.5 1.5 10 14.5 7 9 1.5 6l13-4.5Z" />
                </svg>
                Send message
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
