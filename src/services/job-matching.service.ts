import { demoJobs } from '../data/demo-jobs';
import { DemoJob, UserProfile } from '../types';

class JobMatchingService {
  findMatches(user: UserProfile): DemoJob[] {
    return demoJobs.slice(0, 3);
  }
}

export default new JobMatchingService();
