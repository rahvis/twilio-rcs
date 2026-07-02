import fs from 'fs';
import { Collection, MongoClient } from 'mongodb';
import path from 'path';
import { AuditEvent, ConsentRecord, UserProfile } from '../types';
import logger, { maskPhoneNumber } from '../utils/logger';

interface StoredState {
  users: Record<string, UserProfile>;
  consentRecords: ConsentRecord[];
  auditEvents: AuditEvent[];
}

interface StoredStateDocument extends StoredState {
  _id: string;
  updatedAt: string;
}

const emptyState = (): StoredState => ({
  users: {},
  consentRecords: [],
  auditEvents: []
});

class UserStoreService {
  private readonly statePath: string;
  private readonly mongoUri?: string;
  private readonly mongoDbName: string;
  private readonly mongoCollectionName: string;
  private readonly mongoDocumentId: string;
  private mongoClient?: MongoClient;
  private mongoCollection?: Collection<StoredStateDocument>;
  private dbReady = false;
  private state: StoredState;

  constructor() {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.statePath = path.join(dataDir, 'rcs-state.json');
    this.mongoUri = process.env.RCS_MONGODB_URI || process.env.MONGODB_URI;
    this.mongoDbName = process.env.RCS_MONGODB_DB_NAME || process.env.MONGODB_DB_NAME || 'workonward_rcs';
    this.mongoCollectionName = process.env.RCS_MONGODB_COLLECTION || 'RcsConsentStates';
    this.mongoDocumentId = process.env.RCS_MONGODB_DOCUMENT_ID || 'default';
    fs.mkdirSync(dataDir, { recursive: true });
    this.state = this.loadState();
  }

  async initialize(): Promise<void> {
    if (!this.mongoUri) {
      logger.info('RCS state store using local JSON persistence only');
      return;
    }

    try {
      this.mongoClient = new MongoClient(this.mongoUri);
      await this.mongoClient.connect();
      this.mongoCollection = this.mongoClient
        .db(this.mongoDbName)
        .collection<StoredStateDocument>(this.mongoCollectionName);

      const stored = await this.mongoCollection.findOne({ _id: this.mongoDocumentId });
      if (stored) {
        this.state = {
          users: stored.users || {},
          consentRecords: stored.consentRecords || [],
          auditEvents: stored.auditEvents || []
        };
        this.persistLocal();
      } else {
        await this.persistToDatabase();
      }

      this.dbReady = true;
      logger.info('RCS state store using MongoDB persistence', {
        dbName: this.mongoDbName,
        collectionName: this.mongoCollectionName,
        userCount: Object.keys(this.state.users).length,
        consentRecordCount: this.state.consentRecords.length
      });
    } catch (error) {
      this.dbReady = false;
      logger.error('Failed to initialize MongoDB RCS state store; falling back to local JSON persistence', {
        error
      });
    }
  }

  async close(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }

  async flush(): Promise<void> {
    if (this.dbReady) {
      await this.persistToDatabase();
    }
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
    this.persistLocal();

    if (this.dbReady) {
      void this.persistToDatabase();
    }
  }

  private persistLocal(): void {
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

  private async persistToDatabase(): Promise<void> {
    if (!this.mongoCollection) {
      return;
    }

    try {
      await this.mongoCollection.updateOne(
        { _id: this.mongoDocumentId },
        {
          $set: {
            users: this.state.users,
            consentRecords: this.state.consentRecords,
            auditEvents: this.state.auditEvents,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
    } catch (error) {
      logger.error('Failed to persist RCS state to MongoDB', { error });
    }
  }
}

export default new UserStoreService();
