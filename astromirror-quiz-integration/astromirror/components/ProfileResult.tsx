'use client';

import { motion } from 'framer-motion';
import type { Profile, FallbackProfile, ScoreState, Disclaimer } from '@/types/quiz';

const tokens = {
  bg_primary: '#070708',
  bg_surface: '#0F1012',
  gold_primary: '#D4AF37',
  gold_muted: '#B8975E',
  emerald_deep: '#0F3D2E',
  text_ivory: '#F6F0E1',
  text_mist: '#CFC7B8',
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

interface ProfileResultProps {
  profile: Profile | FallbackProfile;
  scores: ScoreState;
  disclaimer?: Disclaimer;
  showCTA?: boolean;
  onCTAClick?: () => void;
}

export default function ProfileResult({
  profile,
  disclaimer,
  showCTA = true,
  onCTAClick,
}: ProfileResultProps) {
  const isFullProfile = 'strengths' in profile;

  const handleCTA = () => {
    if ('cta_url' in profile) {
      onCTAClick?.();
      window.location.href = profile.cta_url;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="text-center max-w-xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ fontSize: '4rem', marginBottom: '1.5rem', color: tokens.gold_primary }}
      >
        ◈
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p style={{ color: tokens.gold_muted, fontSize: '0.9rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          DEIN KOSMISCHER ARCHETYP
        </p>
        <h1 style={{ color: tokens.text_ivory, fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.25rem' }}>
          {profile.archetype_name}
        </h1>
        <p style={{ color: tokens.gold_primary, fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '2rem' }}>
          {profile.archetype_subtitle}
        </p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: tokens.text_ivory, fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}
      >
        {profile.headline}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ color: tokens.text_mist, fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', whiteSpace: 'pre-line' }}
      >
        {profile.description}
      </motion.div>

      {isFullProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', textAlign: 'left' }}
        >
          <div>
            <h4 style={{ color: tokens.gold_primary, marginBottom: '0.75rem' }}>Stärken</h4>
            {(profile as Profile).strengths.map((s, i) => (
              <p key={i} style={{ color: tokens.text_mist, fontSize: '0.9rem', marginBottom: '0.5rem' }}>• {s}</p>
            ))}
          </div>
          <div>
            <h4 style={{ color: tokens.gold_muted, marginBottom: '0.75rem' }}>Wachstum</h4>
            {(profile as Profile).growth_edges.map((g, i) => (
              <p key={i} style={{ color: tokens.text_mist, fontSize: '0.9rem', marginBottom: '0.5rem' }}>• {g}</p>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        style={{ background: tokens.bg_surface, padding: '24px', borderLeft: `3px solid ${tokens.gold_muted}`, marginBottom: '2rem', textAlign: 'left' }}
      >
        <p style={{ color: tokens.text_ivory, fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {profile.bridge_text}
        </p>
      </motion.div>

      {showCTA && 'cta_text' in profile && (
        <motion.button
          onClick={handleCTA}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '16px 48px',
            background: tokens.emerald_deep,
            color: tokens.gold_primary,
            border: `1px solid ${tokens.gold_muted}`,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          {profile.cta_text}
        </motion.button>
      )}

      {disclaimer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          style={{ color: tokens.text_mist, fontSize: '0.75rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}
        >
          {disclaimer.full}
        </motion.p>
      )}
    </motion.div>
  );
}
