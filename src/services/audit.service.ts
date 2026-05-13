import { AuditEvent } from '../types';
import userStoreService from './user-store.service';
import { randomUUID } from 'crypto';

class AuditService {
  record(
    phoneNumber: string,
    type: string,
    messageSid?: string,
    metadata?: AuditEvent['metadata']
  ): void {
    userStoreService.recordAudit({
      id: randomUUID(),
      phoneNumber,
      type,
      messageSid,
      metadata,
      createdAt: new Date().toISOString()
    });
  }
}

export default new AuditService();
