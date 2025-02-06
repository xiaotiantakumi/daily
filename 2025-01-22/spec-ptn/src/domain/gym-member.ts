export class GymMember {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly age: number,
    public readonly membershipType: 'Regular' | 'Premium' | 'Trial',
    public readonly joinedDate: Date,
    public readonly isPaymentUpToDate: boolean,
    public readonly lastVisitedDate: Date | null
  ) {}
}
