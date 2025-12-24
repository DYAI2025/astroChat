'use client';

// AstroMirror Cosmic Archetype Quiz
// React component with Framer Motion animations

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  Question,
  Answer,
  QuizResult,
  DesignTokens,
  Disclaimer,
  Profile,
  FallbackProfile,
} from '@/types/quiz';

// Design Tokens als CSS Custom Properties
const tokens: DesignTokens = {
  bg_primary: '#070708',
  bg_surface: '#0F1012',
  gold_primary: '#D4AF37',
  gold_muted: '#B8975E',
  emerald_deep: '#0F3D2E',
  text_ivory: '#F6F0E1',
  text_mist: '#CFC7B8',
};

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const pulseGold = {
  initial: { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(212, 175, 55, 0.4)',
      '0 0 0 15px rgba(212, 175, 55, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

// Quiz State Type
type QuizState = 'loading' | 'intro' | 'question' | 'processing' | 'result' | 'error';

interface QuizComponentProps {
  onComplete?: (result: QuizResult) => void;
  onCTAClick?: (url: string) => void;
}

export default function CosmicArchetypeQuiz({
  onComplete,
  onCTAClick,
}: QuizComponentProps) {
  // State
  const [state, setState] = useState<QuizState>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 7 });
  const [result, setResult] = useState<QuizResult | null>(null);
  const [disclaimer, setDisclaimer] = useState<Disclaimer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  // Start Quiz
  const startQuiz = useCallback(async () => {
    try {
      setState('loading');
      
      const response = await fetch('/api/quiz/start', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }
      
      const data = await response.json();
      
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setProgress({ current: 0, total: data.total_questions });
      setTitle(data.meta.title);
      setSubtitle(data.meta.subtitle);
      setDisclaimer(data.meta.disclaimer);
      setState('intro');
      
    } catch (err) {
      console.error('Start error:', err);
      setError('Konnte Quiz nicht starten. Bitte später erneut versuchen.');
      setState('error');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  // Begin Quiz (after intro)
  const beginQuiz = () => {
    setState('question');
  };

  // Handle Answer Selection
  const handleAnswer = useCallback(async (answer: Answer) => {
    if (!sessionId || !currentQuestion) return;
    
    setState('processing');
    
    try {
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer_id: answer.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      
      setProgress({ current: data.progress.current, total: data.progress.total });
      
      if (data.is_complete) {
        // Fetch result
        const resultResponse = await fetch(data.result_url);
        if (!resultResponse.ok) {
          throw new Error('Failed to fetch result');
        }
        
        const resultData = await resultResponse.json();
        setResult(resultData.result);
        setDisclaimer(resultData.disclaimer);
        setState('result');
        
        onComplete?.(resultData.result);
        
      } else {
        setCurrentQuestion(data.next_question);
        setState('question');
      }
      
    } catch (err) {
      console.error('Answer error:', err);
      setError('Fehler beim Verarbeiten. Bitte erneut versuchen.');
      setState('error');
    }
  }, [sessionId, currentQuestion, onComplete]);

  // Handle CTA Click
  const handleCTA = () => {
    const profile = result?.profile;
    if (profile && 'cta_url' in profile) {
      onCTAClick?.(profile.cta_url);
      window.location.href = profile.cta_url;
    }
  };

  // Retry on Error
  const retry = () => {
    setError(null);
    startQuiz();
  };

  // Render Loading
  if (state === 'loading') {
    return (
      <div className="quiz-container" style={{ background: tokens.bg_primary }}>
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48,
            height: 48,
            border: `2px solid ${tokens.gold_muted}`,
            borderTopColor: tokens.gold_primary,
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  // Render Error
  if (state === 'error') {
    return (
      <div className="quiz-container" style={{ background: tokens.bg_primary }}>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="error-card">
          <h2 style={{ color: tokens.text_ivory }}>Etwas ist schiefgelaufen</h2>
          <p style={{ color: tokens.text_mist }}>{error}</p>
          <button
            onClick={retry}
            className="quiz-button"
            style={{
              background: tokens.emerald_deep,
              color: tokens.text_ivory,
              border: `1px solid ${tokens.gold_muted}`,
            }}
          >
            Erneut versuchen
          </button>
        </motion.div>
      </div>
    );
  }

  // Render Intro
  if (state === 'intro') {
    return (
      <div className="quiz-container" style={{ background: tokens.bg_primary }}>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="intro-card"
        >
          <motion.div
            className="intro-symbol"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            ✧
          </motion.div>
          
          <h1 style={{ color: tokens.text_ivory, fontSize: '2rem', marginBottom: '0.5rem' }}>
            {title}
          </h1>
          
          <p style={{ color: tokens.gold_muted, fontSize: '1.1rem', marginBottom: '2rem' }}>
            {subtitle}
          </p>
          
          <p style={{ color: tokens.text_mist, maxWidth: '400px', lineHeight: 1.6 }}>
            7 Fragen. 3 Minuten. Eine Begegnung mit dem kosmischen Muster, 
            das unter deiner Oberfläche schwingt.
          </p>
          
          <motion.button
            onClick={beginQuiz}
            className="quiz-button primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...pulseGold}
            style={{
              marginTop: '2rem',
              padding: '16px 48px',
              background: 'transparent',
              color: tokens.gold_primary,
              border: `1px solid ${tokens.gold_primary}`,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            BEGINNEN
          </motion.button>
          
          {disclaimer && (
            <p style={{ 
              color: tokens.text_mist, 
              fontSize: '0.75rem', 
              marginTop: '2rem',
              opacity: 0.7 
            }}>
              {disclaimer.short}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Render Question
  if ((state === 'question' || state === 'processing') && currentQuestion) {
    return (
      <div className="quiz-container" style={{ background: tokens.bg_primary }}>
        {/* Progress Bar */}
        <div className="progress-bar" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0,
          height: '3px',
          background: tokens.bg_surface,
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ 
              height: '100%', 
              background: `linear-gradient(90deg, ${tokens.gold_muted}, ${tokens.gold_primary})`,
            }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="question-card"
          >
            {/* Question Counter */}
            <div style={{ 
              color: tokens.gold_muted, 
              fontSize: '0.85rem', 
              letterSpacing: '0.2em',
              marginBottom: '1.5rem' 
            }}>
              {progress.current + 1} / {progress.total}
            </div>
            
            {/* Headline */}
            <h2 style={{ 
              color: tokens.gold_primary, 
              fontSize: '1.1rem',
              fontWeight: 400,
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}>
              {currentQuestion.headline}
            </h2>
            
            {/* Question Text */}
            <h3 style={{ 
              color: tokens.text_ivory, 
              fontSize: '1.5rem',
              fontWeight: 300,
              lineHeight: 1.4,
              marginBottom: '0.75rem',
              maxWidth: '500px',
            }}>
              {currentQuestion.question_text}
            </h3>
            
            {/* Subtext */}
            <p style={{ 
              color: tokens.text_mist, 
              fontSize: '0.9rem',
              fontStyle: 'italic',
              marginBottom: '2.5rem',
            }}>
              {currentQuestion.question_subtext}
            </p>
            
            {/* Answers */}
            <motion.div 
              className="answers-grid"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {currentQuestion.answers.map((answer, index) => (
                <motion.button
                  key={answer.id}
                  variants={fadeInUp}
                  onClick={() => state !== 'processing' && handleAnswer(answer)}
                  disabled={state === 'processing'}
                  whileHover={state !== 'processing' ? { 
                    scale: 1.01,
                    borderColor: tokens.gold_primary,
                  } : {}}
                  whileTap={state !== 'processing' ? { scale: 0.99 } : {}}
                  className="answer-button"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '20px 24px',
                    marginBottom: '12px',
                    background: tokens.bg_surface,
                    color: tokens.text_ivory,
                    border: `1px solid ${tokens.gold_muted}33`,
                    borderRadius: '4px',
                    fontSize: '1rem',
                    textAlign: 'left',
                    cursor: state === 'processing' ? 'wait' : 'pointer',
                    opacity: state === 'processing' ? 0.7 : 1,
                    transition: 'border-color 0.3s, opacity 0.3s',
                  }}
                >
                  <span style={{ 
                    color: tokens.gold_muted, 
                    marginRight: '12px',
                    fontFamily: 'serif',
                  }}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {answer.text}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Render Result
  if (state === 'result' && result) {
    const profile = result.profile;
    const isFullProfile = 'strengths' in profile;
    
    return (
      <div className="quiz-container result" style={{ background: tokens.bg_primary }}>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="result-card"
        >
          {/* Reveal Animation */}
          <motion.div
            className="result-symbol"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              fontSize: '4rem',
              marginBottom: '1.5rem',
              color: tokens.gold_primary,
            }}
          >
            ◈
          </motion.div>
          
          {/* Archetype Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p style={{ 
              color: tokens.gold_muted, 
              fontSize: '0.9rem', 
              letterSpacing: '0.2em',
              marginBottom: '0.5rem',
            }}>
              DEIN KOSMISCHER ARCHETYP
            </p>
            
            <h1 style={{ 
              color: tokens.text_ivory, 
              fontSize: '2.5rem',
              fontWeight: 300,
              marginBottom: '0.25rem',
            }}>
              {profile.archetype_name}
            </h1>
            
            <p style={{ 
              color: tokens.gold_primary, 
              fontSize: '1rem',
              letterSpacing: '0.1em',
              marginBottom: '2rem',
            }}>
              {profile.archetype_subtitle}
            </p>
          </motion.div>
          
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ 
              color: tokens.text_ivory, 
              fontSize: '1.3rem',
              fontWeight: 400,
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              maxWidth: '500px',
            }}
          >
            {profile.headline}
          </motion.h2>
          
          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ 
              color: tokens.text_mist, 
              fontSize: '1rem',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: '550px',
              whiteSpace: 'pre-line',
            }}
          >
            {profile.description}
          </motion.div>
          
          {/* Strengths & Growth (if full profile) */}
          {isFullProfile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem',
                maxWidth: '550px',
              }}
            >
              <div>
                <h4 style={{ color: tokens.gold_primary, marginBottom: '0.75rem' }}>
                  Stärken
                </h4>
                {(profile as Profile).strengths.map((s, i) => (
                  <p key={i} style={{ 
                    color: tokens.text_mist, 
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                  }}>
                    • {s}
                  </p>
                ))}
              </div>
              <div>
                <h4 style={{ color: tokens.gold_muted, marginBottom: '0.75rem' }}>
                  Wachstum
                </h4>
                {(profile as Profile).growth_edges.map((g, i) => (
                  <p key={i} style={{ 
                    color: tokens.text_mist, 
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                  }}>
                    • {g}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Bridge Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            style={{ 
              background: tokens.bg_surface,
              padding: '24px',
              borderLeft: `3px solid ${tokens.gold_muted}`,
              marginBottom: '2rem',
              maxWidth: '550px',
            }}
          >
            <p style={{ 
              color: tokens.text_ivory, 
              fontSize: '0.95rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {profile.bridge_text}
            </p>
          </motion.div>
          
          {/* CTA */}
          {'cta_text' in profile && (
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
          
          {/* Disclaimer */}
          {disclaimer && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 }}
              style={{ 
                color: tokens.text_mist, 
                fontSize: '0.75rem',
                maxWidth: '400px',
                lineHeight: 1.5,
              }}
            >
              {disclaimer.full}
            </motion.p>
          )}
        </motion.div>
        
        <style jsx global>{`
          .quiz-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .quiz-container.result {
            justify-content: flex-start;
            padding-top: 4rem;
          }
          
          .intro-card,
          .question-card,
          .result-card,
          .error-card {
            text-align: center;
            max-width: 600px;
          }
          
          .intro-symbol {
            font-size: 3rem;
            color: ${tokens.gold_primary};
            margin-bottom: 1.5rem;
          }
          
          .quiz-button {
            font-family: inherit;
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .quiz-button:hover {
            background: ${tokens.emerald_deep};
          }
          
          @media (max-width: 600px) {
            .quiz-container {
              padding: 1rem;
            }
            
            h1 { font-size: 1.75rem !important; }
            h3 { font-size: 1.25rem !important; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
