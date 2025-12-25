/**
 * Quiz Engine Tests
 * Tests für Scoring-Algorithmus und Profil-Matching
 */

import {
  initializeScores,
  applyAnswerScoring,
  calculateTotalScores,
  determineProfile,
} from '@/lib/quiz-engine'
import type { ScoreState, Answer, Profile, FallbackProfile } from '@/types/quiz'

describe('Quiz Engine - Scoring', () => {
  describe('initializeScores', () => {
    it('should create score state with all dimensions at 0', () => {
      const scores = initializeScores()

      expect(scores).toEqual({
        fire: 0,
        water: 0,
        air: 0,
        earth: 0,
        cardinal: 0,
        fixed: 0,
        mutable: 0,
        solar: 0,
        lunar: 0,
      })
    })

    it('should return new object each time', () => {
      const scores1 = initializeScores()
      const scores2 = initializeScores()

      expect(scores1).not.toBe(scores2)
      expect(scores1).toEqual(scores2)
    })
  })

  describe('applyAnswerScoring', () => {
    it('should add answer scores to existing scores', () => {
      const scores: ScoreState = initializeScores()
      const answer: Answer = {
        id: 'answer-A',
        text: 'Test answer',
        scoring: {
          fire: 2,
          cardinal: 1,
          solar: 1,
        },
      }

      const newScores = applyAnswerScoring(scores, answer)

      expect(newScores.fire).toBe(2)
      expect(newScores.cardinal).toBe(1)
      expect(newScores.solar).toBe(1)
      expect(newScores.water).toBe(0)
    })

    it('should accumulate scores from multiple answers', () => {
      let scores = initializeScores()

      const answer1: Answer = {
        id: 'answer-1',
        text: 'First',
        scoring: { fire: 2, solar: 1 },
      }

      const answer2: Answer = {
        id: 'answer-2',
        text: 'Second',
        scoring: { fire: 1, water: 2, lunar: 1 },
      }

      scores = applyAnswerScoring(scores, answer1)
      scores = applyAnswerScoring(scores, answer2)

      expect(scores.fire).toBe(3) // 2 + 1
      expect(scores.water).toBe(2)
      expect(scores.solar).toBe(1)
      expect(scores.lunar).toBe(1)
    })

    it('should not mutate original scores object', () => {
      const originalScores = initializeScores()
      const answer: Answer = {
        id: 'test',
        text: 'Test',
        scoring: { fire: 5 },
      }

      applyAnswerScoring(originalScores, answer)

      expect(originalScores.fire).toBe(0) // Unchanged
    })

    it('should handle negative scores', () => {
      const scores = initializeScores()
      const answer: Answer = {
        id: 'test',
        text: 'Test',
        scoring: { fire: -1, water: 2 },
      }

      const newScores = applyAnswerScoring(scores, answer)

      expect(newScores.fire).toBe(-1)
      expect(newScores.water).toBe(2)
    })

    it('should ignore unknown keys in scoring', () => {
      const scores = initializeScores()
      const answer: Answer = {
        id: 'test',
        text: 'Test',
        scoring: {
          fire: 1,
          // @ts-ignore - testing invalid key
          invalidKey: 999,
        },
      }

      const newScores = applyAnswerScoring(scores, answer)

      expect(newScores.fire).toBe(1)
      expect(newScores).not.toHaveProperty('invalidKey')
    })
  })

  describe('calculateTotalScores', () => {
    it('should calculate total scores from array of answers', () => {
      const answers: Answer[] = [
        {
          id: 'answer-1',
          text: 'A1',
          scoring: { fire: 2, cardinal: 1 },
        },
        {
          id: 'answer-2',
          text: 'A2',
          scoring: { fire: 1, water: 2, fixed: 1 },
        },
        {
          id: 'answer-3',
          text: 'A3',
          scoring: { air: 3, mutable: 1, solar: 1 },
        },
      ]

      const scores = calculateTotalScores(answers)

      expect(scores).toEqual({
        fire: 3,
        water: 2,
        air: 3,
        earth: 0,
        cardinal: 1,
        fixed: 1,
        mutable: 1,
        solar: 1,
        lunar: 0,
      })
    })

    it('should return zero scores for empty answers array', () => {
      const scores = calculateTotalScores([])

      expect(scores).toEqual(initializeScores())
    })
  })

  describe('determineProfile', () => {
    const mockProfiles: Profile[] = [
      {
        id: 'fire-cardinal-solar',
        title: 'Der Pionier',
        subtitle: 'Feurig und initiativ',
        description: 'Test description',
        element: 'fire',
        modality: 'cardinal',
        orientation: 'solar',
        matching_criteria: {
          primary: 'fire',
          secondary: 'cardinal',
          tertiary: 'solar',
        },
      },
      {
        id: 'water-fixed-lunar',
        title: 'Der Bewahrer',
        subtitle: 'Tief und stabil',
        description: 'Test description',
        element: 'water',
        modality: 'fixed',
        orientation: 'lunar',
        matching_criteria: {
          primary: 'water',
          secondary: 'fixed',
          tertiary: 'lunar',
        },
      },
    ]

    const mockFallback: FallbackProfile = {
      id: 'hybrid',
      title: 'Kosmischer Hybrid',
      subtitle: 'Vielfältig',
      description: 'Fallback profile',
      is_fallback: true,
    }

    it('should match profile when all criteria align', () => {
      const scores: ScoreState = {
        fire: 10,
        water: 2,
        air: 3,
        earth: 1,
        cardinal: 8,
        fixed: 2,
        mutable: 1,
        solar: 6,
        lunar: 1,
      }

      const result = determineProfile(scores, mockProfiles, mockFallback)

      expect(result.profile.id).toBe('fire-cardinal-solar')
      expect(result.isFallback).toBe(false)
    })

    it('should prioritize primary criterion (highest weight)', () => {
      const scores: ScoreState = {
        fire: 10, // Primary match
        water: 8,
        air: 2,
        earth: 1,
        cardinal: 3,
        fixed: 9, // Different modality
        mutable: 1,
        solar: 2,
        lunar: 8, // Different orientation
      }

      const result = determineProfile(scores, mockProfiles, mockFallback)

      // Should still match fire profile due to primary criterion weight
      expect(result.profile.element).toBe('fire')
    })

    it('should use fallback when no profile matches well', () => {
      const scores: ScoreState = {
        fire: 5,
        water: 5,
        air: 5,
        earth: 5,
        cardinal: 3,
        fixed: 3,
        mutable: 3,
        solar: 2,
        lunar: 2,
      }

      const result = determineProfile(scores, mockProfiles, mockFallback)

      expect(result.profile.id).toBe('hybrid')
      expect(result.isFallback).toBe(true)
    })

    it('should handle tie-breaking deterministically', () => {
      // Equal scores for fire and water
      const scores: ScoreState = {
        fire: 5,
        water: 5,
        air: 2,
        earth: 1,
        cardinal: 5,
        fixed: 5,
        mutable: 1,
        solar: 3,
        lunar: 3,
      }

      const result1 = determineProfile(scores, mockProfiles, mockFallback)
      const result2 = determineProfile(scores, mockProfiles, mockFallback)

      // Should return same result consistently
      expect(result1.profile.id).toBe(result2.profile.id)
    })

    it('should work with single profile', () => {
      const singleProfile = [mockProfiles[0]]
      const scores: ScoreState = {
        fire: 1,
        water: 0,
        air: 0,
        earth: 0,
        cardinal: 1,
        fixed: 0,
        mutable: 0,
        solar: 1,
        lunar: 0,
      }

      const result = determineProfile(scores, singleProfile, mockFallback)

      expect(result.profile.id).toBe('fire-cardinal-solar')
    })
  })
})

describe('Quiz Engine - Integration', () => {
  it('should correctly calculate profile from full quiz answers', () => {
    // Simulate 7 questions answered
    const answers: Answer[] = [
      { id: 'q1-A', text: 'Answer 1', scoring: { fire: 2, cardinal: 1, solar: 1 } },
      { id: 'q2-B', text: 'Answer 2', scoring: { fire: 1, cardinal: 1 } },
      { id: 'q3-C', text: 'Answer 3', scoring: { fire: 1, solar: 1 } },
      { id: 'q4-A', text: 'Answer 4', scoring: { cardinal: 1, solar: 1 } },
      { id: 'q5-D', text: 'Answer 5', scoring: { fire: 1 } },
      { id: 'q6-B', text: 'Answer 6', scoring: { solar: 1 } },
      { id: 'q7-A', text: 'Answer 7', scoring: { fire: 1, cardinal: 1 } },
    ]

    const scores = calculateTotalScores(answers)

    expect(scores.fire).toBe(6)
    expect(scores.cardinal).toBe(4)
    expect(scores.solar).toBe(4)

    // Dominant element: Fire
    // Dominant modality: Cardinal
    // Dominant orientation: Solar
    // Expected profile: Fire + Cardinal + Solar
  })

  it('should handle mixed scoring patterns', () => {
    const answers: Answer[] = [
      { id: 'q1', text: 'A', scoring: { fire: 2, water: 1 } },
      { id: 'q2', text: 'B', scoring: { water: 3 } },
      { id: 'q3', text: 'C', scoring: { air: 2, mutable: 1 } },
      { id: 'q4', text: 'D', scoring: { earth: 1, fixed: 2 } },
      { id: 'q5', text: 'A', scoring: { lunar: 2 } },
      { id: 'q6', text: 'B', scoring: { water: 1, lunar: 1 } },
      { id: 'q7', text: 'C', scoring: { water: 1 } },
    ]

    const scores = calculateTotalScores(answers)

    // Water should dominate
    expect(scores.water).toBeGreaterThan(scores.fire)
    expect(scores.water).toBeGreaterThan(scores.air)
    expect(scores.water).toBeGreaterThan(scores.earth)
  })
})

/**
 * Test Coverage Notes:
 *
 * ✅ Covered:
 * - Score initialization
 * - Single answer scoring
 * - Score accumulation
 * - Immutability
 * - Profile matching
 * - Fallback behavior
 * - Tie-breaking
 *
 * ⚠️ Edge Cases to Add:
 * - Very large score values (overflow?)
 * - All profiles match equally (rare but possible)
 * - Empty profiles array
 * - Malformed scoring data
 *
 * 🔒 Security:
 * - Scoring data comes from JSON file (trusted source)
 * - No user input in scoring calculation
 * - No SQL or external API calls
 * - Pure functions = easy to test and verify
 */
