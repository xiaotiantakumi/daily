export class Campaign {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly validPeriod: {
      start: Date;
      end: Date;
    }
  ) {}
}
