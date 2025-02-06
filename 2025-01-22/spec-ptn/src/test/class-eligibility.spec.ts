import { testMembers, testClasses } from './test-data';
import { AgeSpecification } from '../specifications/age-specification';
import { MembershipTypeSpecification } from '../specifications/membership-specification';
import { PaymentStatusSpecification } from '../specifications/payment-specification';
import { ClassCapacitySpecification } from '../specifications/class-capacity-specification';
import { AndSpecification } from '../specifications/and-specification';

describe('Class Eligibility Specification', () => {
  const advancedYoga = testClasses.find((c) => c.id === 'c1')!;

  const eligibilitySpec = new AndSpecification(
    new AndSpecification(
      new AgeSpecification(18),
      new MembershipTypeSpecification('Premium')
    ),
    new AndSpecification(
      new PaymentStatusSpecification(),
      new ClassCapacitySpecification(advancedYoga)
    )
  );

  it('should return eligible members for Advanced Yoga class', () => {
    const eligibleMembers = testMembers.filter(
      (m) =>
        eligibilitySpec.isSatisfiedBy(m) &&
        advancedYoga.requiredMembership === m.membershipType
    );

    expect(eligibleMembers.length).toBe(2);
    expect(eligibleMembers.map((m) => m.name)).toEqual(
      expect.arrayContaining(['Alice', 'Charlie'])
    );
  });

  it('should not include ineligible members', () => {
    const ineligibleMembers = testMembers.filter(
      (m) => !eligibilitySpec.isSatisfiedBy(m)
    );

    expect(ineligibleMembers.length).toBe(2);
    expect(ineligibleMembers.map((m) => m.name)).toEqual(
      expect.arrayContaining(['Bob', 'David'])
    );
  });
});
