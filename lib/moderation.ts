export interface ModerationResult {
    probabilities: Record<string, number>
    flagged: boolean
    maxLabel: string
    maxScore: number
  }
  
  export const LABELS = [
    'toxic',
    'severe_toxic',
    'obscene',
    'threat',
    'insult',
    'identity_hate'
  ]
  
  /**
   * Generate mock moderation probabilities
   * In production, this would call the real BERT model via HuggingFace API
   */
  export function generateMockProbabilities(): Record<string, number> {
    const probs: Record<string, number> = {}
    LABELS.forEach(label => {
      probs[label] = Math.random() * 0.9
    })
    return probs
  }
  
  /**
   * Check if content is flagged based on thresholds
   */
  export function checkIfFlagged(
    probabilities: Record<string, number>,
    thresholds: Record<string, number>
  ): boolean {
    return Object.entries(probabilities).some(
      ([label, score]) => score >= (thresholds[label] ?? 0.5)
    )
  }
  
  /**
   * Get the max scoring label
   */
  export function getMaxLabel(
    probabilities: Record<string, number>
  ): { label: string; score: number } {
    let maxLabel = ''
    let maxScore = 0
  
    Object.entries(probabilities).forEach(([label, score]) => {
      if (score > maxScore) {
        maxScore = score
        maxLabel = label
      }
    })
  
    return { label: maxLabel, score: maxScore }
  }
  
  /**
   * Moderate a single text
   */
  export async function moderateText(
    text: string,
    thresholds: Record<string, number>
  ): Promise<ModerationResult> {
    const probabilities = generateMockProbabilities()
    const { label: maxLabel, score: maxScore } = getMaxLabel(probabilities)
    const flagged = checkIfFlagged(probabilities, thresholds)
  
    return {
      probabilities,
      flagged,
      maxLabel,
      maxScore
    }
  }
  
  /**
   * Rate limiting helper
   */
  export function isRateLimited(count: number, limit: number): boolean {
    return count >= limit
  }
  