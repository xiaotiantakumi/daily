export class GymClass {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly requiredMembership: 'Regular' | 'Premium',
    public readonly capacity: number,
    public readonly isFull: boolean
  ) {}
}
