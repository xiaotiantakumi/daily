import { AbstractSpecification } from './base-specification';
import { GymMember } from '../domain/gym-member';

export class PaymentStatusSpecification extends AbstractSpecification<GymMember> {
  isSatisfiedBy(candidate: GymMember): boolean {
    return candidate.isPaymentUpToDate;
  }
}
