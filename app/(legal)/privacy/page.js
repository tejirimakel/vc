import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — TheValueChain",
  description:
    "How TheValueChain collects, uses, and protects your data under the Nigeria Data Protection Act 2023 and GDPR.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="legal-meta">Last updated: 21 June 2026</p>

      <p className="legal-note">
        This policy is a draft pending legal review. Bracketed items
        (e.g. registered entity name and address) must be confirmed before
        publication.
      </p>

      <p>
        TheValueChain (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
        the news and media app at{" "}
        <Link href="/">thevaluechainng.com</Link> (the &quot;Service&quot;). We
        publish news articles, e-copy editions, and video, including a live
        stream. The Service is free and does not offer user accounts, logins, or
        payments.
      </p>
      <p>
        This policy explains what personal data we process, why, the legal bases
        we rely on, and the rights you have. We handle data in line with the{" "}
        <strong>Nigeria Data Protection Act 2023 (NDPA)</strong> and, for readers
        in the EU and UK, the <strong>GDPR</strong> and <strong>UK GDPR</strong>.
        Questions: <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
      </p>

      <h2>Who is responsible for your data</h2>
      <p>
        The data controller is <strong>TheValueChain</strong>
        {" "}(registered name and address: [to be confirmed]). Contact:{" "}
        <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
      </p>

      <h2>What personal data we collect</h2>
      <p>
        We collect very little. We do <strong>not</strong> ask for your name,
        email, or account details, because the Service has no accounts.
      </p>
      <ul>
        <li>
          <strong>App-session cookie (<code>tvc_pwa_access</code>).</strong> A
          first-party cookie marking an app session and keeping the installed-app
          experience distinct from the public website. It contains a signed
          timestamp, not your identity, and is not used for advertising. It
          expires after up to 30 days.
        </li>
        <li>
          <strong>Technical logs (IP address &amp; request data).</strong> When
          your browser requests content through our server routes, our hosting
          provider processes your IP address, request time, user agent, and the
          resource requested, to deliver content and keep the Service secure. IP
          addresses are treated as personal data.
        </li>
        <li>
          <strong>Embedded YouTube videos.</strong> Video is delivered via
          embedded YouTube players, loaded only when you choose to play a video.
          At that point Google/YouTube may set its own cookies under{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            Google&apos;s privacy policy
          </a>.
        </li>
      </ul>
      <p>
        We do not knowingly collect special-category data (health, biometric,
        etc.) and do not collect payment data.
      </p>

      <h2>How we use your data</h2>
      <ul>
        <li>To deliver articles, e-copy editions, and video to your device.</li>
        <li>To operate and secure the Service and prevent abuse of our endpoints.</li>
        <li>To comply with legal obligations and respond to lawful requests.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell or rent your personal data, and do not
        use it for cross-site advertising.
      </p>

      <h2>Legal bases for processing</h2>
      <p>
        We rely on our <strong>legitimate interests</strong> (operating a secure
        service, the functional app-session cookie, and server logs) and on your{" "}
        <strong>consent</strong> for non-essential cookies and third-party
        tracking, including embedded YouTube video, for readers in the EU and UK.
        Where we rely on consent, you may withdraw it at any time.
      </p>

      <h2>Sharing and third parties</h2>
      <p>We share data only with service providers that help us run the Service:</p>
      <ul>
        <li><strong>Vercel</strong> — hosting and content delivery.</li>
        <li><strong>Google / YouTube</strong> — video playback (only when you play a video).</li>
        <li>Our publishing back end — source of articles and e-copy content.</li>
      </ul>
      <p>
        We may also disclose data where required by law or to protect our rights,
        users, or the public.
      </p>

      <h2>International data transfers</h2>
      <p>
        Our hosting and some processors (e.g. Vercel, Google) may store and
        process data on servers <strong>outside Nigeria, including in the United
        States</strong>. Where we transfer personal data across borders, we rely
        on appropriate safeguards under the NDPA and, for EU/UK readers, the
        GDPR/UK GDPR.
      </p>

      <h2>Data retention</h2>
      <ul>
        <li>App-session cookie: up to 30 days, then it expires.</li>
        <li>Server/access logs: retained no longer than [retention window to be confirmed], then deleted or anonymised.</li>
      </ul>

      <h2>Your rights</h2>
      <p>Under the NDPA (and GDPR/UK GDPR for EU/UK readers), you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you;</li>
        <li>Rectify inaccurate data;</li>
        <li>Erase your data;</li>
        <li>Restrict or object to processing;</li>
        <li>Data portability, where applicable;</li>
        <li>Withdraw consent, where we rely on it;</li>
        <li>Lodge a complaint with a supervisory authority.</li>
      </ul>
      <p>
        To exercise a right, email{" "}
        <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
        You may complain to the <strong>Nigeria Data Protection Commission
        (NDPC)</strong> or, for EU/UK readers, your local Data Protection
        Authority or the UK ICO.
      </p>

      <h2>Cookies and consent</h2>
      <p>
        We use a small number of cookies: the strictly necessary{" "}
        <code>tvc_pwa_access</code> cookie, and third-party YouTube cookies set
        only when you play a video. You can manage cookies in your browser
        settings. For visitors in the EU/UK, non-essential cookies (including
        YouTube) are set only after you consent.
      </p>

      <h2>Data security</h2>
      <p>
        We use reasonable technical and organisational measures, including HTTPS
        encryption, restricted infrastructure access, rate limiting and request
        validation, and dependency scanning. No method of transmission or storage
        is completely secure.
      </p>
      <h3>Breach notification</h3>
      <p>
        If a personal-data breach is likely to result in a risk to your rights, we
        will notify the NDPC within 72 hours of becoming aware of it, and notify
        affected individuals where required.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        The Service is a general-audience news publication and is not directed at
        children. We do not knowingly collect personal data from children.
      </p>

      <h2>Links to other sites</h2>
      <p>
        The Service links to and embeds third-party content. We are not
        responsible for the privacy practices of those third parties.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time, posting the new version here
        with an updated date and, for material changes, a prominent notice.
      </p>

      <h2>Governing law</h2>
      <p>
        This policy is governed by the laws of the Federal Republic of Nigeria,
        without prejudice to data-protection rights available to readers in other
        jurisdictions.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, requests, or complaints:{" "}
        <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
      </p>
    </>
  );
}
