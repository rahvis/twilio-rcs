import fs from 'fs';
import path from 'path';
import { AuditEvent, ConsentRecord, UserProfile } from '../types';
import logger, { maskPhoneNumber } from '../utils/logger';

interface StoredState {
  users: Record<string, UserProfile>;
  consentRecords: ConsentRecord[];
  auditEvents: AuditEvent[];
}

const emptyState = (): StoredState => ({
  users: {},
  consentRecords: [],
  auditEvents: []
});

class UserStoreService {
  private readonly statePath: string;
  private state: StoredState;

  constructor() {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.statePath = path.join(dataDir, 'rcs-state.json');
    fs.mkdirSync(dataDir, { recursive: true });
    this.state = this.loadState();
  }

  getUser(phoneNumber: string): UserProfile | undefined {
    return this.state.users[phoneNumber];
  }

  getOrCreateUser(phoneNumber: string): UserProfile {
    const existing = this.getUser(phoneNumber);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const user: UserProfile = {
      phoneNumber,
      consentStatus: 'unknown',
      flowStage: 'not_started',
      handoffRequested: false,
      conversationState: {
        latestPresentedJobIds: []
      },
      createdAt: now,
      updatedAt: now
    };

    this.state.users[phoneNumber] = user;
    this.persist();

    logger.info('Created user profile', {
      phoneNumber: maskPhoneNumber(phoneNumber)
    });

    return user;
  }

  saveUser(user: UserProfile): UserProfile {
    user.updatedAt = new Date().toISOString();
    this.state.users[user.phoneNumber] = user;
    this.persist();
    return user;
  }

  recordConsent(record: ConsentRecord): void {
    this.state.consentRecords.push(record);
    this.persist();
  }

  recordAudit(event: AuditEvent): void {
    this.state.auditEvents.push(event);
    this.persist();
  }

  markInbound(phoneNumber: string): UserProfile {
    const user = this.getOrCreateUser(phoneNumber);
    user.lastInboundAt = new Date().toISOString();
    return this.saveUser(user);
  }

  markOutbound(phoneNumber: string): UserProfile {
    const user = this.getOrCreateUser(phoneNumber);
    user.lastOutboundAt = new Date().toISOString();
    return this.saveUser(user);
  }

  private loadState(): StoredState {
    if (!fs.existsSync(this.statePath)) {
      return emptyState();
    }

    try {
      const raw = fs.readFileSync(this.statePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        users: parsed.users || {},
        consentRecords: parsed.consentRecords || [],
        auditEvents: parsed.auditEvents || []
      };
    } catch (error) {
      logger.error('Failed to load RCS state store', { error });
      return emptyState();
    }
  }

  private persist(): void {
    const tempPath = `${this.statePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(this.state, null, 2), 'utf8');

    try {
      fs.renameSync(tempPath, this.statePath);
    } catch (error) {
      logger.warn('Atomic state write failed, falling back to direct write', {
        error
      });
      fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');

      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (unlinkError) {
          logger.warn('Failed to remove temporary state file', {
            error: unlinkError
          });
        }
      }
    }
  }
}

export default new UserStoreService();
