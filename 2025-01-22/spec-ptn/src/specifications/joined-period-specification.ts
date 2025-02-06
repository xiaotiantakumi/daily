import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';

export class JoinedPeriodSpecification extends AbstractSpecification<GymMember> {
  constructor(private readonly months: number) {
    super();
  }

  isSatisfiedBy(candidate: GymMember): boolean {
    const now = new Date();
    const joinedDate = candidate.joinedDate;
    const monthsDiff =
      (now.getFullYear() - joinedDate.getFullYear()) * 12 +
      (now.getMonth() - joinedDate.getMonth());

    return monthsDiff >= this.months;
  }
}
