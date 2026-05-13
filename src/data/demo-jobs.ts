import { DemoJob } from '../types';

export const demoJobs: DemoJob[] = [
  {
    id: 'job-warehouse-morning-90011',
    title: 'Warehouse Associate',
    employer: 'LA Fresh Logistics',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90011',
    languages: ['English', 'Spanish'],
    shifts: ['morning', 'afternoon'],
    payRange: '$19-$22/hr',
    summary: 'Picking, packing, and inventory support for a local distribution site.',
    verifiedEmployer: true,
    noFees: true
  },
  {
    id: 'job-restaurant-evening-90012',
    title: 'Restaurant Crew Member',
    employer: 'Civic Center Kitchen',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90012',
    languages: ['English', 'Spanish', 'Korean'],
    shifts: ['evening', 'weekend'],
    payRange: '$18-$21/hr',
    summary: 'Guest support, prep, and closing shifts near downtown transit.',
    verifiedEmployer: true,
    noFees: true
  },
  {
    id: 'job-caregiving-flex-90020',
    title: 'Caregiving Assistant',
    employer: 'Neighbor Care Partners',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90020',
    languages: ['English', 'Korean'],
    shifts: ['morning', 'weekend', 'flexible'],
    payRange: '$20-$24/hr',
    summary: 'Entry-level support role with verified local care teams.',
    verifiedEmployer: true,
    noFees: true
  },
  {
    id: 'job-retail-afternoon-90650',
    title: 'Retail Stock Associate',
    employer: 'Norwalk Market Group',
    city: 'Norwalk',
    state: 'CA',
    zip: '90650',
    languages: ['English', 'Spanish'],
    shifts: ['afternoon', 'evening'],
    payRange: '$17-$20/hr',
    summary: 'Stockroom, shelf replenishment, and customer support.',
    verifiedEmployer: true,
    noFees: true
  },
  {
    id: 'job-cleaning-overnight-90802',
    title: 'Facilities Cleaning Team',
    employer: 'Harbor Facility Services',
    city: 'Long Beach',
    state: 'CA',
    zip: '90802',
    languages: ['English', 'Spanish', 'Korean'],
    shifts: ['overnight', 'weekend'],
    payRange: '$18-$23/hr',
    summary: 'Commercial cleaning and facilities support with local supervisors.',
    verifiedEmployer: true,
    noFees: true
  }
];
