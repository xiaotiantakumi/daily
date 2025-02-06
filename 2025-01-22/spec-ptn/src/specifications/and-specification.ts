import { Specification } from './base-specification';
import { specificationFactory } from './specification-factory';

export class AndSpecification<T> implements Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {}

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
    );
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
