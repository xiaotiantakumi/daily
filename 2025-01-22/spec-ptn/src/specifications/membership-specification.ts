import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';

export class MembershipTypeSpecification extends AbstractSpecification<GymMember> {
  constructor(private readonly requiredType: 'Regular' | 'Premium') {
    super();
  }

  isSatisfiedBy(candidate: GymMember): boolean {
    return candidate.membershipType === this.requiredType;
  }
}
