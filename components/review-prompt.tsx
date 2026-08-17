'use client';

/**
 * ReviewPromptModal — pops up after 7, 30, and 90 days of account use.
 *
 * Timing is measured from `ziada-account-since` stored in localStorage
 * on first mount (first day the user lands on an authenticated page).
 *
 * localStorage keys:
 *   ziada-account-since    → ISO date string, first time this component mounted
 *   ziada-review-done-7d   → "1" once the 7-day prompt was dismissed or submitted
 *   ziada-review-done-30d  → "1" once the 30-day prompt was dismissed or submitted
 *   ziada-review-done-90d  → "1" once the 90-day prompt was dismissed or submitted
 */

import React, { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

type Trigger = '7d' | '30d' | '90d';

const TRIGGERS: { key: Trigger; days: number; headline: string; sub: string }[] = [
  {
    key: '7d', days: 7,
    headline: 'How is Ziada working for you?',
    sub: 'You\'ve been running your duka on Ziada for a week. Quick question — how is it going?',
  },
  {
    key: '30d', days: 30,
    headline: 'One month in — what do you think?',
    sub: 'Your honest review helps us improve and helps other shopkeepers across Tanzania decide.',
  },
  {
    key: '90d', days: 90,
    headline: '3 months of Ziada — thank you!',
    sub: 'You\'ve been with us for 3 months. A quick rating means a lot to the team.',
  },
];

// ── Stars ──────────────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  const active = hovered || value;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            style={{
              background: 'transparent', border: 0, cursor: 'pointer', padding: '2px 3px',
              transition: 'transform 120ms',
              transform: active >= n ? 'scale(1.18)' : 'scale(1)',
            }}
            aria-label={`${n} star`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={active >= n ? '#fbbf24' : 'none'}
                stroke={active >= n ? '#fbbf24' : 'var(--line-2)'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
      {active > 0 && (
        <div style={{ fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
          {labels[active].toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ReviewPromptModalProps {
  trigger: Trigger;
  onDone: (trigger: Trigger) => void;
}

function ReviewPromptModal({ trigger, onDone }: ReviewPromptModalProps) {
  const cfg = TRIGGERS.find(t => t.key === trigger)!;
  const [rating,    setRating]    = useState(0);
  const [body,      setBody]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      // Mock: simulate review submission
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Silent — don't block the user if the review fails to submit
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => onDone(trigger), 1600);
    }
  }

  return (
    <>
      <style>{`
        .review-overlay {
          position: fixed; inset: 0; z-index: 900;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 200ms ease;
        }
        .review-modal {
          background: var(--bg-2); border: 1px solid var(--line);
          border-radius: 16px; width: 100%; max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45);
          padding: 28px 28px 24px;
          animation: slideUp 200ms ease;
        }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
      `}</style>

      <div className="review-overlay">
        <div className="review-modal">
          {submitted ? (
            /* Thank-you state */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Asante sana!</div>
              <div style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>Your feedback means a lot to us.</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: '0 auto 14px',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {cfg.headline}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                  {cfg.sub}
                </p>
              </div>

              {/* Stars */}
              <div style={{ marginBottom: 18 }}>
                <StarRating value={rating} onChange={setRating} />
              </div>

              {/* Optional comment */}
              {rating > 0 && (
                <div style={{ marginBottom: 18, animation: 'slideUp 150ms ease' }}>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder={rating >= 4 ? "What do you love most?" : "What can we improve?"}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--line-2)', background: 'var(--bg)',
                      color: 'var(--fg)', fontFamily: 'var(--sans)', fontSize: 13.5,
                      resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                      lineHeight: 1.5,
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onDone(trigger)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: '1px solid var(--line-2)', background: 'transparent',
                    color: 'var(--fg-3)', fontFamily: 'var(--sans)', fontSize: 13,
                    cursor: 'pointer', transition: 'background 120ms',
                  }}
                >
                  Maybe later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 8, border: 0,
                    background: rating === 0 ? 'var(--bg-3)' : 'var(--accent)',
                    color: rating === 0 ? 'var(--fg-4)' : '#fff',
                    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
                    cursor: rating === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background 150ms, opacity 150ms',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </div>

              {/* Small privacy note */}
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--fg-4)' }}>
                Your review may appear on our website after moderation.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Hook: decide which trigger (if any) to show ────────────────────────────────

function useReviewTrigger(): Trigger | null {
  const [activeTrigger, setActiveTrigger] = useState<Trigger | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Record first-seen date on first ever mount
    const sinceKey = 'ziada-account-since';
    let sinceStr = localStorage.getItem(sinceKey);
    if (!sinceStr) {
      sinceStr = new Date().toISOString();
      localStorage.setItem(sinceKey, sinceStr);
    }

    const since     = new Date(sinceStr);
    const now       = new Date();
    const daysElapsed = (now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24);

    // Find the highest-priority trigger eligible and not yet shown
    for (const t of [...TRIGGERS].reverse()) {
      if (daysElapsed >= t.days && !localStorage.getItem(`ziada-review-done-${t.key}`)) {
        // 4-second delay so the page fully renders before the modal appears
        const timer = setTimeout(() => setActiveTrigger(t.key), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return activeTrigger;
}

// ── Exported component ─────────────────────────────────────────────────────────

export function ReviewPrompt() {
  const trigger = useReviewTrigger();
  const [dismissed, setDismissed] = useState(false);

  const handleDone = useCallback((t: Trigger) => {
    localStorage.setItem(`ziada-review-done-${t}`, '1');
    setDismissed(true);
  }, []);

  if (!trigger || dismissed) return null;
  return <ReviewPromptModal trigger={trigger} onDone={handleDone} />;
}
