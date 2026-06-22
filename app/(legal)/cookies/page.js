import Link from "next/link";

export const metadata = {
  title: "Cookie Policy — TheValueChain",
  description: "The cookies and similar technologies used by TheValueChain, and how to manage them.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p className="legal-meta">Last updated: 21 June 2026</p>

      <p className="legal-note">
        Draft pending legal review before publication.
      </p>

      <p>
        This policy explains the cookies and similar technologies used on{" "}
        <Link href="/">thevaluechainng.com</Link> (the &quot;Service&quot;). It
        supplements our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>What cookies we use</h2>
      <ul>
        <li>
          <strong>Strictly necessary — <code>tvc_pwa_access</code>.</strong>{" "}
          A first-party cookie that marks an app session and keeps the
          installed-app experience distinct from the public website. It holds a
          signed timestamp, not your identity, and expires after up to 30 days.
          This cookie is required for the app experience and is not used for
          tracking or advertising.
        </li>
        <li>
          <strong>Third-party — YouTube (Google).</strong> Set by Google only
          when you choose to play an embedded video, under Google&apos;s own
          policies.
        </li>
      </ul>

      <h2>Consent</h2>
      <p>
        Strictly necessary cookies do not require consent. For visitors in the EU
        and UK, non-essential cookies — including YouTube/third-party cookies —
        are set only after you consent. You can change or withdraw your choice at
        any time.
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies through your browser settings. Blocking
        the strictly necessary cookie may affect how the app behaves. Disabling
        third-party cookies will not prevent you from reading articles but may
        affect embedded video.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies:{" "}
        <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
      </p>
    </>
  );
}
