import React from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32, marginTop: 32 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <section style={{ padding: '72px 0 96px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 12 }}>LEGAL</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>Terms of Service</h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-4)' }}>Last updated: June 2026 · Effective immediately</div>
          <p style={{ margin: '16px 0 0', fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.7 }}>
            These Terms of Service govern your use of Ziada, a retail management platform operated by Ziada Technologies Ltd, a company registered in Tanzania. By using Ziada, you agree to these terms.
          </p>
        </div>

        <Section title="1. The Service">
          <p>Ziada provides a retail operating system including point-of-sale, inventory management, credit tracking, analytics, and AI-powered insights. The service is offered as a subscription (Software-as-a-Service) accessible via <strong>app.ziadapos.com</strong> and mobile applications.</p>
          <p>We reserve the right to modify or discontinue features with reasonable notice. We will not materially reduce core functionality without offering an appropriate remedy.</p>
        </Section>

        <Section title="2. Free Trial">
          <p>All new accounts are eligible for a 7-day free trial. A one-time activation fee of TZS 10,000 is required to unlock the trial. This fee is non-refundable unless the service fails to function as described.</p>
          <p>After the trial period, your account will require an active paid subscription to continue accessing the service. Your data is retained for 30 days after trial expiry before permanent deletion.</p>
        </Section>

        <Section title="3. Subscriptions and Billing">
          <p>Subscriptions are billed monthly or annually in Tanzanian Shillings (TZS). Payment is accepted via M-Pesa, Tigo Pesa, Airtel Money, and bank transfer.</p>
          <p>You are responsible for all fees incurred under your account. If a payment fails, we will notify you and provide a grace period of 7 days before service suspension. Annual subscriptions are non-refundable after the 30-day money-back window has passed.</p>
          <p>We may adjust pricing with 30 days written notice to the email address on your account. Price changes do not apply to prepaid annual subscriptions until renewal.</p>
        </Section>

        <Section title="4. Cancellation and Refunds">
          <p>You may cancel your subscription at any time from Settings → Billing. Cancellation takes effect at the end of your current billing period — you retain access until then.</p>
          <p>If you cancel within 30 days of your first paid subscription (not the trial), you are entitled to a full refund. Requests must be sent to <a href="mailto:contact@ziadapos.com" style={{ color: 'var(--accent)' }}>contact@ziadapos.com</a>.</p>
          <p>After the 30-day window, subscription fees are non-refundable. Data export is available for 30 days after account closure.</p>
        </Section>

        <Section title="5. Your Data">
          <p>You own all data you enter into Ziada — sales records, customer information, product catalogues, and credit ledgers. We do not claim ownership of your business data.</p>
          <p>We process your data as a data processor acting on your instructions. You are the data controller under applicable Tanzanian law and any relevant data protection regulations.</p>
          <p>You can export your data at any time in CSV or PDF format. Upon account termination, data is retained for 30 days before deletion, unless legally required otherwise.</p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You may use Ziada only for lawful retail business operations. You may not use the platform to process fraudulent transactions, engage in money laundering, or violate any applicable law of the United Republic of Tanzania.</p>
          <p>You are responsible for all activity under your account, including activity by staff accounts you create. You must not share login credentials or allow unauthorised access to your account.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The Ziada platform, its design, code, and content are the intellectual property of Ziada Technologies Ltd and its affiliates (Camel Tech, Camel Creatives). You are granted a limited, non-exclusive, non-transferable licence to use the service during your subscription term.</p>
          <p>You may not copy, reverse-engineer, or create derivative works from the Ziada software.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>Ziada is provided &quot;as is&quot;. To the maximum extent permitted by law, we exclude all liability for indirect losses including loss of business, lost profits, or data loss arising from use or inability to use the service.</p>
          <p>Our total liability to you in any 12-month period is limited to the fees you paid to us during that period.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These terms are governed by the laws of the United Republic of Tanzania. Any disputes shall be resolved in the courts of Dar es Salaam, Tanzania, unless both parties agree to alternative dispute resolution.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            For questions about these terms, contact us at:<br />
            <a href="mailto:contact@ziadapos.com" style={{ color: 'var(--accent)' }}>contact@ziadapos.com</a><br />
            WhatsApp: <a href="https://wa.me/255692069230" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>0692069230</a><br />
            Ziada Technologies Ltd · Dar es Salaam, Tanzania
          </p>
        </Section>
      </div>
    </section>
  );
}
