import { Specification } from './base-specification';
import { AndSpecification } from './and-specification';
import { OrSpecification } from './or-specification';
import { NotSpecification } from './not-specification';

export interface SpecificationFactory<T> {
  createAnd(left: Specification<T>, right: Specification<T>): Specification<T>;
  createOr(left: Specification<T>, right: Specification<T>): Specification<T>;
  createNot(specification: Specification<T>): Specification<T>;
}

export class DefaultSpecificationFactory<T> implements SpecificationFactory<T> {
  createAnd(left: Specification<T>, right: Specification<T>): Specification<T> {
    return new AndSpecification(left, right);
  }

  createOr(left: Specification<T>, right: Specification<T>): Specification<T> {
    return new OrSpecification(left, right);
  }

  createNot(specification: Specification<T>): Specification<T> {
    return new NotSpecification(specification);
  }
}

export const specificationFactory = new DefaultSpecificationFactory<any>();
