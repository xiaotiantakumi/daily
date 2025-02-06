import { GymMember } from '../domain/gym-member';
import { GymClass } from '../domain/gym-class';
import { Campaign } from '../domain/campaign';

export const testMembers: GymMember[] = [
  {
    id: '1',
    name: 'Alice',
    age: 25,
    membershipType: 'Premium',
    joinedDate: new Date('2024-01-01'),
    isPaymentUpToDate: true,
    lastVisitedDate: new Date('2024-03-15'),
  },
  {
    id: '2',
    name: 'Bob',
    age: 17,
    membershipType: 'Regular',
    joinedDate: new Date('2024-02-01'),
    isPaymentUpToDate: false,
    lastVisitedDate: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Charlie',
    age: 30,
    membershipType: 'Premium',
    joinedDate: new Date('2023-06-01'),
    isPaymentUpToDate: true,
    lastVisitedDate: new Date('2024-04-01'),
  },
  {
    id: '4',
    name: 'David',
    age: 22,
    membershipType: 'Regular',
    joinedDate: new Date('2023-12-01'),
    isPaymentUpToDate: true,
    lastVisitedDate: new Date('2024-02-28'),
  },
];

export const testClasses: GymClass[] = [
  {
    id: 'c1',
    name: 'Advanced Yoga',
    requiredMembership: 'Premium',
    capacity: 10,
    isFull: false,
  },
  {
    id: 'c2',
    name: 'Beginner Yoga',
    requiredMembership: 'Regular',
    capacity: 20,
    isFull: true,
  },
  {
    id: 'c3',
    name: 'Boxing',
    requiredMembership: 'Regular',
    capacity: 15,
    isFull: false,
  },
];

export const testCampaigns: Campaign[] = [
  {
    id: 'cp1',
    name: '6ヶ月継続割引',
    description: '6ヶ月以上継続利用中の会員に適用',
    validPeriod: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
    },
  },
  {
    id: 'cp2',
    name: '学生割引',
    description: '25歳以下の学生に適用',
    validPeriod: {
      start: new Date('2024-04-01'),
      end: new Date('2024-09-30'),
    },
  },
];
