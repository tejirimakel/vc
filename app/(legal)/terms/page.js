import Link from "next/link";

export const metadata = {
  title: "Terms of Use — TheValueChain",
  description: "The terms governing your use of TheValueChain news and media service.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Use</h1>
      <p className="legal-meta">Last updated: 21 June 2026</p>

      <p className="legal-note">
        Draft pending legal review. Confirm the publishing entity name and
        governing-law/dispute wording with counsel before publication.
      </p>

      <p>
        These Terms govern your use of TheValueChain news and media service at{" "}
        <Link href="/">thevaluechainng.com</Link> (the &quot;Service&quot;),
        operated by TheValueChain [registered entity to be confirmed]. By using
        the Service you agree to these Terms. If you do not agree, do not use the
        Service.
      </p>

      <h2>The Service</h2>
      <p>
        The Service provides free access to news articles, e-copy editions, and
        video, including a live stream. It does not require an account and does
        not offer paid features. We may change, suspend, or discontinue any part
        of the Service at any time.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service unlawfully or in breach of these Terms;</li>
        <li>Attempt to disrupt, overload, or gain unauthorised access to the Service or its infrastructure, including our content-proxy endpoints;</li>
        <li>Scrape, harvest, or systematically extract content except as permitted by law;</li>
        <li>Reproduce, redistribute, or create derivative works from our content without permission (see our <Link href="/copyright">Copyright Notice</Link>);</li>
        <li>Circumvent any access, security, or rate-limiting measure.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        All content on the Service, including articles, e-copy editions, images,
        logos, and the TheValueChain name, is owned by us or our licensors and is
        protected under the Copyright Act 2022 and other applicable laws. Embedded
        third-party content (e.g. YouTube videos) remains the property of its
        owners.
      </p>

      <h2>Third-party content and links</h2>
      <p>
        The Service embeds and links to third-party content and services. We do
        not control and are not responsible for third-party content, sites, or
        their terms and privacy practices.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The Service and its content are provided &quot;as is&quot; for general
        information. While we strive for accuracy, we make no warranties that the
        Service will be uninterrupted, error-free, or that content is complete or
        current. News content reflects reporting at the time of publication.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, TheValueChain is not liable for
        any indirect, incidental, or consequential loss arising from your use of,
        or inability to use, the Service. [Liability wording to be confirmed with
        counsel.]
      </p>

      <h2>Privacy</h2>
      <p>
        Your use of the Service is also governed by our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The updated version takes
        effect when posted here with a new date.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the Federal Republic of Nigeria.
        [Dispute-resolution venue to be confirmed.]
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a>.
      </p>
    </>
  );
}
