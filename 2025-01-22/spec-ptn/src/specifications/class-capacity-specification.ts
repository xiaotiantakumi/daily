import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';
import { GymClass } from '../domain/gym-class';

export class ClassCapacitySpecification extends AbstractSpecification<GymMember> {
  constructor(private gymClass: GymClass) {
    super();
  }

  isSatisfiedBy(candidate: GymMember): boolean {
    return !this.gymClass.isFull;
  }
}
