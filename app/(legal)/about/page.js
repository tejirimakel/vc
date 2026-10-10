import Link from "next/link";

export const metadata = {
  title: "About & Contact — TheValueChain",
  description: "About TheValueChain news and media service, and how to reach us.",
};

export default function AboutPage() {
  return (
    <>
      <h1>About TheValueChain</h1>
      <p className="legal-meta">Last updated: 21 June 2026</p>

      <p className="legal-note">
        Draft pending the masthead, named editorial team, and registered entity
        details, which credibility and Google News eligibility depend on.
      </p>

      <p>
        TheValueChain is a free news and media service publishing news articles,
        e-copy editions, and video, including a live stream, at{" "}
        <Link href="/">thevaluechainng.com</Link>.
      </p>

      <h2>Who we are</h2>
      <p>
        TheValueChain is published by [registered entity name to be confirmed].
        Our editorial team [named team and masthead to be added].
      </p>

      <h2>What we do</h2>
      <p>
        We bring readers timely news and media across web and our progressive web
        app, which can be installed for an app-like experience and offline
        reading of saved content.
      </p>

      <h2>Contact</h2>
      <ul>
        <li>General &amp; privacy: <a href="mailto:privacy@thevaluechainng.com">privacy@thevaluechainng.com</a></li>
        <li>Editorial &amp; corrections: see our <Link href="/editorial">Editorial Policy</Link></li>
        <li>Copyright &amp; takedown: see our <Link href="/copyright">Copyright Notice</Link></li>
      </ul>

      <h2>Postal address</h2>
      <p>[Registered address to be confirmed.]</p>
    </>
  );
}
