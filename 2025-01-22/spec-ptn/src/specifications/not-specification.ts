import { Specification } from './base-specification';
import { specificationFactory } from './specification-factory';

export class NotSpecification<T> implements Specification<T> {
  constructor(private readonly specification: Specification<T>) {}

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }

  and(other: Specification<T>): Specification<T> {
    return specificationFactory.createAnd(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return specificationFactory.createOr(this, other);
  }

  not(): Specification<T> {
    return specificationFactory.createNot(this);
  }
}
