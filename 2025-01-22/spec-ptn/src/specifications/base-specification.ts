import {
  SpecificationFactory,
  DefaultSpecificationFactory,
} from './specification-factory';

export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

export abstract class AbstractSpecification<T> implements Specification<T> {
  private factory: SpecificationFactory<T> = new DefaultSpecificationFactory();

  abstract isSatisfiedBy(candidate: T): boolean;

  setFactory(factory: SpecificationFactory<T>): void {
    this.factory = factory;
  }

  and(other: Specification<T>): Specification<T> {
    return this.factory.createAnd(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return this.factory.createOr(this, other);
  }

  not(): Specification<T> {
    return this.factory.createNot(this);
  }
}
