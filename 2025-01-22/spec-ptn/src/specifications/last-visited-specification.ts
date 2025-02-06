import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';

export class LastVisitedSpecification extends AbstractSpecification<GymMember> {
  constructor(private readonly maxMonths: number) {
    super();
  }

  isSatisfiedBy(candidate: GymMember): boolean {
    if (!candidate.lastVisitedDate) return false;

    const now = new Date();
    const lastVisitedDate = candidate.lastVisitedDate;
    const monthsDiff =
      (now.getFullYear() - lastVisitedDate.getFullYear()) * 12 +
      (now.getMonth() - lastVisitedDate.getMonth());

    return monthsDiff <= this.maxMonths;
  }
}
