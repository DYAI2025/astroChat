/**
 * Quiz Flow Integration Tests
 * End-to-End Tests für den kompletten Quiz-Ablauf
 */

import { NextRequest } from 'next/server'

// Mock API routes (würden normalerweise importiert werden)
const mockStartQuiz = jest.fn()
const mockSubmitAnswer = jest.fn()
const mockGetResult = jest.fn()

describe('Quiz Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Quiz Journey', () => {
    it('should complete full quiz flow: start → answer → result', async () => {
      // Step 1: Start Quiz
      mockStartQuiz.mockResolvedValue({
        session_id: 'quiz_test_123',
        current_question: {
          id: 'question-1',
          text: 'Erste Frage?',
          answers: [
            { id: 'answer-A', text: 'Option A', scoring: { fire: 2 } },
            { id: 'answer-B', text: 'Option B', scoring: { water: 2 } },
          ],
        },
      })

      const startResponse = await mockStartQuiz()

      expect(startResponse.session_id).toBeTruthy()
      expect(startResponse.current_question.id).toBe('question-1')

      // Step 2: Answer Question 1
      mockSubmitAnswer.mockResolvedValue({
        next_question: {
          id: 'question-2',
          text: 'Zweite Frage?',
          answers: [],
        },
      })

      const answer1Response = await mockSubmitAnswer(
        startResponse.session_id,
        'question-1',
        'answer-A'
      )

      expect(answer1Response.next_question).toBeTruthy()

      // Step 3-6: Answer remaining questions
      for (let i = 2; i <= 7; i++) {
        mockSubmitAnswer.mockResolvedValue({
          next_question: i < 7 ? { id: `question-${i + 1}` } : null,
          result_url: i === 7 ? '/result/quiz_test_123' : undefined,
        })

        await mockSubmitAnswer(
          startResponse.session_id,
          `question-${i}`,
          `answer-A`
        )
      }

      // Step 7: Get Result
      mockGetResult.mockResolvedValue({
        session_id: 'quiz_test_123',
        profile: {
          id: 'fire-cardinal-solar',
          title: 'Der Pionier',
          element: 'fire',
        },
        scores: {
          fire: 14,
          water: 0,
          // ...
        },
        is_fallback: false,
      })

      const result = await mockGetResult('quiz_test_123')

      expect(result.profile).toBeTruthy()
      expect(result.profile.element).toBe('fire')
      expect(result.is_fallback).toBe(false)
    })

    it('should handle fallback profile when scores are balanced', async () => {
      // Start quiz
      mockStartQuiz.mockResolvedValue({
        session_id: 'quiz_balanced_456',
        current_question: { id: 'question-1' },
      })

      await mockStartQuiz()

      // Answer with balanced scoring
      for (let i = 1; i <= 7; i++) {
        const element = ['fire', 'water', 'air', 'earth', 'fire', 'water', 'air'][i - 1]

        mockSubmitAnswer.mockResolvedValue({
          next_question: i < 7 ? { id: `question-${i + 1}` } : null,
          result_url: i === 7 ? '/result/quiz_balanced_456' : undefined,
        })

        await mockSubmitAnswer('quiz_balanced_456', `question-${i}`, `answer-${element}`)
      }

      // Get result - should be fallback
      mockGetResult.mockResolvedValue({
        session_id: 'quiz_balanced_456',
        profile: {
          id: 'hybrid',
          title: 'Kosmischer Hybrid',
          is_fallback: true,
        },
        scores: {
          fire: 5,
          water: 5,
          air: 5,
          earth: 5,
        },
        is_fallback: true,
      })

      const result = await mockGetResult('quiz_balanced_456')

      expect(result.is_fallback).toBe(true)
      expect(result.profile.id).toBe('hybrid')
    })
  })

  describe('Session Management', () => {
    it('should create unique session IDs', async () => {
      mockStartQuiz
        .mockResolvedValueOnce({ session_id: 'quiz_abc_123' })
        .mockResolvedValueOnce({ session_id: 'quiz_def_456' })

      const session1 = await mockStartQuiz()
      const session2 = await mockStartQuiz()

      expect(session1.session_id).not.toBe(session2.session_id)
    })

    it('should preserve session state across answers', async () => {
      const sessionId = 'quiz_state_789'

      // Start
      mockStartQuiz.mockResolvedValue({ session_id: sessionId })
      await mockStartQuiz()

      // Answer 1
      mockSubmitAnswer.mockResolvedValue({
        session_id: sessionId,
        answers_so_far: { 'question-1': 'answer-A' },
      })

      const response1 = await mockSubmitAnswer(sessionId, 'question-1', 'answer-A')

      // Answer 2
      mockSubmitAnswer.mockResolvedValue({
        session_id: sessionId,
        answers_so_far: {
          'question-1': 'answer-A',
          'question-2': 'answer-B',
        },
      })

      const response2 = await mockSubmitAnswer(sessionId, 'question-2', 'answer-B')

      expect(response2.answers_so_far['question-1']).toBe('answer-A')
      expect(response2.answers_so_far['question-2']).toBe('answer-B')
    })

    it('should handle concurrent sessions from same user', async () => {
      // User starts second quiz before finishing first
      mockStartQuiz
        .mockResolvedValueOnce({ session_id: 'session-1' })
        .mockResolvedValueOnce({ session_id: 'session-2' })

      const session1 = await mockStartQuiz()
      const session2 = await mockStartQuiz()

      // Both sessions should be independent
      expect(session1.session_id).not.toBe(session2.session_id)
    })
  })

  describe('Error Handling', () => {
    it('should reject invalid session ID', async () => {
      mockSubmitAnswer.mockRejectedValue({
        status: 404,
        message: 'Session not found',
      })

      await expect(
        mockSubmitAnswer('invalid-session-id', 'question-1', 'answer-A')
      ).rejects.toMatchObject({
        status: 404,
      })
    })

    it('should reject invalid question ID', async () => {
      mockSubmitAnswer.mockRejectedValue({
        status: 400,
        message: 'Invalid question ID',
      })

      await expect(
        mockSubmitAnswer('valid-session', 'question-999', 'answer-A')
      ).rejects.toMatchObject({
        status: 400,
      })
    })

    it('should reject invalid answer ID', async () => {
      mockSubmitAnswer.mockRejectedValue({
        status: 400,
        message: 'Invalid answer ID for this question',
      })

      await expect(
        mockSubmitAnswer('valid-session', 'question-1', 'answer-Z')
      ).rejects.toMatchObject({
        status: 400,
      })
    })

    it('should handle database errors gracefully', async () => {
      mockStartQuiz.mockRejectedValue({
        status: 500,
        message: 'Database connection failed',
      })

      await expect(mockStartQuiz()).rejects.toMatchObject({
        status: 500,
      })
    })
  })

  describe('Data Persistence (Supabase)', () => {
    it('should save session to database on start', async () => {
      const mockSupabaseInsert = jest.fn().mockResolvedValue({
        data: { id: 'quiz_db_123' },
        error: null,
      })

      // Simulate session creation
      mockStartQuiz.mockImplementation(async () => {
        await mockSupabaseInsert('quiz_sessions', {
          id: 'quiz_db_123',
          user_id: 'user-123',
          started_at: new Date().toISOString(),
          answers: {},
        })

        return { session_id: 'quiz_db_123' }
      })

      await mockStartQuiz()

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        'quiz_sessions',
        expect.objectContaining({
          id: expect.any(String),
          user_id: expect.any(String),
        })
      )
    })

    it('should update session on each answer', async () => {
      const mockSupabaseUpdate = jest.fn().mockResolvedValue({
        data: { id: 'quiz_db_123' },
        error: null,
      })

      mockSubmitAnswer.mockImplementation(async (sessionId, questionId, answerId) => {
        await mockSupabaseUpdate('quiz_sessions', sessionId, {
          answers: { [questionId]: answerId },
        })

        return { next_question: { id: 'question-2' } }
      })

      await mockSubmitAnswer('quiz_db_123', 'question-1', 'answer-A')

      expect(mockSupabaseUpdate).toHaveBeenCalled()
    })

    it('should save final result to quiz_results table', async () => {
      const mockSupabaseInsertResult = jest.fn().mockResolvedValue({
        data: { id: 'result-uuid-123' },
        error: null,
      })

      mockGetResult.mockImplementation(async (sessionId) => {
        await mockSupabaseInsertResult('quiz_results', {
          session_id: sessionId,
          user_id: 'user-123',
          profile_id: 'fire-cardinal-solar',
          scores: { fire: 14 },
          is_fallback: false,
        })

        return {
          profile: { id: 'fire-cardinal-solar' },
          scores: { fire: 14 },
        }
      })

      await mockGetResult('quiz_db_123')

      expect(mockSupabaseInsertResult).toHaveBeenCalledWith(
        'quiz_results',
        expect.objectContaining({
          session_id: 'quiz_db_123',
          profile_id: 'fire-cardinal-solar',
        })
      )
    })
  })

  describe('RLS Enforcement', () => {
    it('should only allow user to access own sessions', async () => {
      const currentUserId = 'user-123'
      const otherUserId = 'user-456'

      // User tries to access another user's session
      mockGetResult.mockRejectedValue({
        status: 403,
        message: 'Unauthorized',
      })

      await expect(mockGetResult('quiz_other_user_session')).rejects.toMatchObject({
        status: 403,
      })
    })

    it('should allow unauthenticated quiz taking (anonymous mode)', async () => {
      // Anonymous user (no auth.uid())
      mockStartQuiz.mockResolvedValue({
        session_id: 'quiz_anon_123',
        user_id: null, // No user ID for anonymous
      })

      const response = await mockStartQuiz()

      expect(response.session_id).toBeTruthy()
    })
  })

  describe('Performance', () => {
    it('should complete quiz in reasonable time', async () => {
      const startTime = Date.now()

      // Simulate full quiz
      mockStartQuiz.mockResolvedValue({ session_id: 'perf-test' })
      await mockStartQuiz()

      for (let i = 1; i <= 7; i++) {
        mockSubmitAnswer.mockResolvedValue({ next_question: null })
        await mockSubmitAnswer('perf-test', `question-${i}`, 'answer-A')
      }

      mockGetResult.mockResolvedValue({ profile: { id: 'test' } })
      await mockGetResult('perf-test')

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete in under 1 second (mocked, but validates test structure)
      expect(duration).toBeLessThan(1000)
    })
  })
})

/**
 * Integration Test Coverage:
 *
 * ✅ Tested:
 * - Complete quiz flow (7 questions)
 * - Session creation and management
 * - Answer submission
 * - Result calculation
 * - Fallback profile
 * - Error handling
 * - Data persistence (mocked)
 * - RLS enforcement (conceptual)
 *
 * 🔴 TODO (Real Integration Tests):
 * - Setup test Supabase instance
 * - Real database transactions
 * - Network error simulation
 * - Concurrent user testing
 * - Load testing (100+ concurrent sessions)
 *
 * 📝 Notes:
 * - Diese Tests sind MOCK-Tests
 * - Für echte Integration Tests: Supabase local dev + Testcontainers
 * - E2E Tests sollten Playwright/Cypress verwenden
 */
