/**
 * spam email detection utility
 * detects bot-generated and spam email patterns
 */

export class SpamDetectionUtil {
  /**
   * check if an email is likely spam based on various patterns
   */
  static isSpamEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [localPart, domain] = normalizedEmail.split('@');

    if (!localPart || !domain) {
      return false;
    }

    // check for repetitive character patterns (e.g., "hhh", "jjj", "aaa")
    if (this.hasRepetitivePattern(localPart)) {
      return true;
    }

    // check for high ratio of repeated characters
    if (this.hasHighRepetitionRatio(localPart)) {
      return true;
    }

    // check for suspicious character sequences
    if (this.hasSuspiciousSequence(localPart)) {
      return true;
    }

    // check for very short or very long local part
    if (localPart.length < 3 || localPart.length > 64) {
      return true;
    }

    // check for excessive use of same character
    if (this.hasExcessiveSameCharacter(localPart)) {
      return true;
    }

    // check for pattern variations (typo-squatting detection)
    if (this.hasPatternVariations(localPart)) {
      return true;
    }

    return false;
  }

  /**
   * detect repetitive patterns like "hhh", "jjj", "aaa", etc.
   */
  private static hasRepetitivePattern(text: string): boolean {
    // check for 3 or more consecutive identical characters
    const repetitivePattern = /(.)\1{2,}/;
    return repetitivePattern.test(text);
  }

  /**
   * check if text has high ratio of repeated characters
   */
  private static hasHighRepetitionRatio(text: string): boolean {
    if (text.length < 5) {
      return false;
    }

    const charCounts: { [key: string]: number } = {};
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    // calculate ratio of most frequent character
    const maxCount = Math.max(...Object.values(charCounts));
    const repetitionRatio = maxCount / text.length;

    // if more than 40% of characters are the same, it's suspicious
    return repetitionRatio > 0.4;
  }

  /**
   * detect suspicious character sequences common in bot-generated emails
   * checks for general patterns, not specific characters
   */
  private static hasSuspiciousSequence(text: string): boolean {
    if (text.length < 6) {
      return false;
    }

    // check for multiple groups of 3+ consecutive identical characters
    // e.g., "aaabbb", "xxxzzz", "hhhjjj" etc.
    const multipleRepetitiveGroups = /(.)\1{2,}.*(.)\2{2,}/;
    if (multipleRepetitiveGroups.test(text)) {
      return true;
    }

    // check for patterns where same character appears in multiple groups
    // e.g., "aaaxaaa", "bbbybbb" etc.
    const sameCharMultipleGroups = /(.)\1{2,}[a-z0-9]*\1{2,}/;
    if (sameCharMultipleGroups.test(text)) {
      return true;
    }

    // check for low character diversity (too few unique characters)
    const uniqueChars = new Set(text).size;
    const diversityRatio = uniqueChars / text.length;
    // if less than 30% of characters are unique, it's suspicious
    if (diversityRatio < 0.3 && text.length > 8) {
      return true;
    }

    return false;
  }

  /**
   * check for excessive use of the same character (more than 50% of string)
   */
  private static hasExcessiveSameCharacter(text: string): boolean {
    if (text.length < 4) {
      return false;
    }

    const charCounts: { [key: string]: number } = {};
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    const maxCount = Math.max(...Object.values(charCounts));
    return maxCount / text.length > 0.5;
  }

  /**
   * detect pattern variations that suggest bot generation
   * checks for general repetitive patterns, not specific characters
   */
  private static hasPatternVariations(text: string): boolean {
    if (text.length < 8) {
      return false;
    }

    // check for multiple groups of repetitive characters (any character)
    // e.g., "aaabbbccc", "xxxzzzyyy" etc.
    const multipleRepetitivePatterns =
      /(.)\1{2,}[a-z0-9]*(.)\2{2,}[a-z0-9]*(.)\3{2,}/;
    if (multipleRepetitivePatterns.test(text)) {
      return true;
    }

    // check for repetitive substrings (suggesting pattern generation)
    // e.g., "abcabcabc", "xyzxyz" etc.
    for (let i = 2; i <= Math.floor(text.length / 2); i++) {
      const substring = text.substring(0, i);
      const repetitions = Math.floor(text.length / i);
      if (repetitions >= 2) {
        const repeatedPattern = substring.repeat(repetitions);
        if (text.startsWith(repeatedPattern)) {
          return true;
        }
      }
    }

    // check for alternating patterns that suggest automation
    // e.g., "abababab", "xyxyxy" etc.
    if (text.length >= 6) {
      const firstTwo = text.substring(0, 2);
      const alternatingPattern = new RegExp(
        `^(${firstTwo[0]}${firstTwo[1]})+$`,
      );
      if (alternatingPattern.test(text)) {
        return true;
      }
    }

    // check for patterns with high repetition density
    // count how many times we see 3+ consecutive characters
    let repetitiveGroupCount = 0;
    let currentChar = '';
    let currentCount = 0;

    for (const char of text) {
      if (char === currentChar) {
        currentCount++;
        if (currentCount === 3) {
          repetitiveGroupCount++;
        }
      } else {
        currentChar = char;
        currentCount = 1;
      }
    }

    // if we have 3+ groups of repetitive characters, it's suspicious
    if (repetitiveGroupCount >= 3) {
      return true;
    }

    return false;
  }

  /**
   * get spam score (0-100) for an email
   * higher score = more likely to be spam
   */
  static getSpamScore(email: string): number {
    if (!email || typeof email !== 'string') {
      return 0;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [localPart] = normalizedEmail.split('@');

    if (!localPart) {
      return 0;
    }

    let score = 0;

    // repetitive patterns (30 points)
    if (this.hasRepetitivePattern(localPart)) {
      score += 30;
    }

    // high repetition ratio (25 points)
    if (this.hasHighRepetitionRatio(localPart)) {
      score += 25;
    }

    // suspicious sequences (20 points) - general pattern detection
    if (this.hasSuspiciousSequence(localPart)) {
      score += 20;
    }

    // excessive same character (15 points)
    if (this.hasExcessiveSameCharacter(localPart)) {
      score += 15;
    }

    // pattern variations (10 points)
    if (this.hasPatternVariations(localPart)) {
      score += 10;
    }

    return Math.min(score, 100);
  }
}
