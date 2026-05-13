/**
 * Session Service
 * Manages in-memory conversation history for each phone number
 * Provides conversation context persistence across messages
 */

import logger, { maskPhoneNumber } from '../utils/logger';
import { Session, ChatMessage } from '../types';

class SessionService {
  // In-memory storage: phoneNumber -> Session
  private sessions: Map<string, Session> = new Map();

  // System prompt for the AI assistant
  private readonly systemPrompt: ChatMessage = {
    role: 'system',
    content: 'You are a helpful AI assistant responding to messages via SMS/RCS. Keep responses concise and friendly, suitable for text messaging.'
  };

  /**
   * Get existing conversation history for a phone number
   * Returns undefined if no session exists
   */
  getConversationHistory(phoneNumber: string): ChatMessage[] | undefined {
    const session = this.sessions.get(phoneNumber);

    if (session) {
      logger.debug('Retrieved existing conversation', {
        phoneNumber: maskPhoneNumber(phoneNumber),
        messageCount: session.conversationHistory.length
      });

      // Update last message timestamp
      session.lastMessageAt = new Date();
    }

    return session?.conversationHistory;
  }

  /**
   * Create a new session for a phone number
   */
  createSession(phoneNumber: string): Session {
    const session: Session = {
      phoneNumber,
      conversationHistory: [this.systemPrompt],
      createdAt: new Date(),
      lastMessageAt: new Date()
    };

    this.sessions.set(phoneNumber, session);

    logger.info('Created new session', {
      phoneNumber: maskPhoneNumber(phoneNumber)
    });

    return session;
  }

  /**
   * Add a user message to conversation history
   */
  addUserMessage(phoneNumber: string, content: string | ChatMessage['content']): void {
    let session = this.sessions.get(phoneNumber);

    if (!session) {
      session = this.createSession(phoneNumber);
    }

    const message: ChatMessage = {
      role: 'user',
      content: content
    };

    session.conversationHistory.push(message);
    session.lastMessageAt = new Date();

    logger.debug('Added user message to history', {
      phoneNumber: maskPhoneNumber(phoneNumber),
      historyLength: session.conversationHistory.length
    });
  }

  /**
   * Add an assistant response to conversation history
   */
  addAssistantMessage(phoneNumber: string, content: string): void {
    const session = this.sessions.get(phoneNumber);

    if (!session) {
      logger.warn('Attempted to add assistant message to non-existent session', {
        phoneNumber: maskPhoneNumber(phoneNumber)
      });
      return;
    }

    const message: ChatMessage = {
      role: 'assistant',
      content: content
    };

    session.conversationHistory.push(message);
    session.lastMessageAt = new Date();

    logger.debug('Added assistant message to history', {
      phoneNumber: maskPhoneNumber(phoneNumber),
      historyLength: session.conversationHistory.length
    });
  }

  /**
   * Check if a session exists for a phone number
   */
  hasSession(phoneNumber: string): boolean {
    return this.sessions.has(phoneNumber);
  }

  /**
   * Delete a session (for cleanup or user opt-out)
   */
  deleteSession(phoneNumber: string): boolean {
    const existed = this.sessions.delete(phoneNumber);

    if (existed) {
      logger.info('Deleted session', {
        phoneNumber: maskPhoneNumber(phoneNumber)
      });
    }

    return existed;
  }

  /**
   * Get all sessions (for analytics/debugging)
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get total number of active sessions
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Cleanup old sessions (optional - can be called periodically)
   * Removes sessions inactive for more than the specified hours
   */
  cleanupInactiveSessions(inactiveHours: number = 24): number {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - inactiveHours * 60 * 60 * 1000);

    let deletedCount = 0;

    for (const [phoneNumber, session] of this.sessions.entries()) {
      if (session.lastMessageAt < cutoffTime) {
        this.deleteSession(phoneNumber);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info('Cleaned up inactive sessions', {
        deletedCount,
        inactiveHours
      });
    }

    return deletedCount;
  }
}

// Export singleton instance
export default new SessionService();
