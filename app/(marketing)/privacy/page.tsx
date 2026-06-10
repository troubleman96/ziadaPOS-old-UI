import React from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32, marginTop: 32 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <section style={{ padding: '72px 0 96px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 12 }}>LEGAL</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-4)' }}>Last updated: June 2026 · Effective immediately</div>
          <p style={{ margin: '16px 0 0', fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
            Ziada Technologies Ltd (&quot;Ziada&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains what data we collect, why, how we store it, and your rights over it.
          </p>
          <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--fg)' }}>Plain English summary:</strong> Your business data — sales, customers, stock, credits — is yours. We never sell it, share it with third parties for marketing, or use it to train AI models. The AI in Ziada reads your data to answer your questions and then discards it.
          </div>
        </div>

        <Section title="1. What We Collect">
          <p><strong style={{ color: 'var(--fg)' }}>Account data:</strong> Your name, phone number, email address, business name, business type, and region. Collected during registration.</p>
          <p><strong style={{ color: 'var(--fg)' }}>Business data:</strong> Sales transactions, product records, customer information, credit ledgers, staff accounts, store settings, and supplier records. You provide this when using the platform.</p>
          <p><strong style={{ color: 'var(--fg)' }}>Payment data:</strong> Transaction references for M-Pesa, Tigo, Airtel, or bank payments. We do not store full mobile money credentials or bank account numbers.</p>
          <p><strong style={{ color: 'var(--fg)' }}>Usage data:</strong> Feature usage patterns, session duration, device type, and browser information. Used to improve the product. This data is anonymised and aggregated.</p>
          <p><strong style={{ color: 'var(--fg)' }}>AI queries:</strong> When you use Ziada AI, your query is sent to an AI model alongside relevant context from your store data. Queries are not retained beyond the current session and are not used to train any model.</p>
        </Section>

        <Section title="2. Why We Collect It">
          <p>We collect data only for the purposes needed to operate the Ziada platform:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>To provide the retail management features you signed up for</li>
            <li>To authenticate your identity and protect your account</li>
            <li>To process subscription payments and send billing receipts</li>
            <li>To respond to support requests</li>
            <li>To improve the product through anonymised usage analytics</li>
            <li>To comply with applicable Tanzanian law and legal obligations</li>
          </ul>
          <p>We do not use your data for advertising, profiling, or selling to third parties.</p>
        </Section>

        <Section title="3. How We Store and Protect Data">
          <p>Your data is stored on servers in Tanzania and encrypted at rest using AES-256 encryption. Data in transit is protected by TLS 1.3.</p>
          <p>We perform regular backups. Access to production data is restricted to authorised Ziada engineering staff and logged for audit purposes.</p>
          <p>In the event of a data breach that affects your personal information, we will notify you within 72 hours of becoming aware of it.</p>
        </Section>

        <Section title="4. Third Parties">
          <p>We use a small number of third-party services to operate the platform. These providers are contractually bound not to use your data for their own purposes:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: 'var(--fg)' }}>Cloud infrastructure:</strong> Hosting and storage</li>
            <li><strong style={{ color: 'var(--fg)' }}>AI inference:</strong> For Ziada AI queries only — no data retention by the model provider</li>
            <li><strong style={{ color: 'var(--fg)' }}>Payment verification:</strong> M-Pesa, Tigo, Airtel APIs for confirming subscription payments</li>
          </ul>
          <p>We do not share your business data with any advertising networks, data brokers, or marketing platforms.</p>
        </Section>

        <Section title="5. AI and Your Data">
          <p>Ziada AI reads context from your store — sales, stock levels, customer records — to answer your questions accurately. This context is:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Not stored beyond the duration of your session</li>
            <li>Not shared with other users or businesses</li>
            <li>Not used to train any AI model — by us or by our AI provider</li>
            <li>Processed under a zero-data-retention agreement with our AI provider</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>Active account data is retained for as long as your subscription is active plus 30 days.</p>
          <p>After account closure, personal and business data is permanently deleted within 30 days. Payment records may be retained for 7 years for tax compliance purposes under Tanzanian law.</p>
          <p>Anonymised usage analytics are retained indefinitely for product improvement purposes.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>You have the right to:</p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li><strong style={{ color: 'var(--fg)' }}>Access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong style={{ color: 'var(--fg)' }}>Correction:</strong> Update inaccurate data from within the platform or by contacting us</li>
            <li><strong style={{ color: 'var(--fg)' }}>Export:</strong> Download your business data in CSV or PDF format from Settings at any time</li>
            <li><strong style={{ color: 'var(--fg)' }}>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong style={{ color: 'var(--fg)' }}>Portability:</strong> Receive your data in a machine-readable format</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:contact@ziadapos.com" style={{ color: 'var(--accent)' }}>contact@ziadapos.com</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Ziada uses a single session cookie (<code style={{ fontFamily: 'var(--mono)', fontSize: 13, background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4 }}>ziada_session</code>) to keep you logged in. We do not use advertising cookies, tracking pixels, or third-party analytics cookies.</p>
          <p>Theme preference (<code style={{ fontFamily: 'var(--mono)', fontSize: 13, background: 'var(--bg-3)', padding: '1px 6px', borderRadius: 4 }}>ziada-theme</code>) is stored in browser localStorage, not transmitted to our servers.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We will notify you by email at least 14 days before any material changes to this policy take effect. Minor updates (corrections, clarifications) may be made without notice and will be reflected in the &quot;Last updated&quot; date above.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            Data protection queries and rights requests:<br />
            <a href="mailto:contact@ziadapos.com" style={{ color: 'var(--accent)' }}>contact@ziadapos.com</a><br />
            WhatsApp: <a href="https://wa.me/255692069230" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>0692069230</a><br />
            Ziada Technologies Ltd · Dar es Salaam, Tanzania
          </p>
        </Section>
      </div>
    </section>
  );
}
