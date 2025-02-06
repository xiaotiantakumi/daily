import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';

export class AgeSpecification extends AbstractSpecification<GymMember> {
  constructor(
    private readonly minAge: number,
    private readonly maxAge?: number
  ) {
    super();
  }

  isSatisfiedBy(candidate: GymMember): boolean {
    if (this.maxAge) {
      return candidate.age >= this.minAge && candidate.age <= this.maxAge;
    }
    return candidate.age >= this.minAge;
  }
}
