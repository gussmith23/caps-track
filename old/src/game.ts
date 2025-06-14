export class Game {
  constructor(
    public id: string,
    public player1id: string,
    public player2id: string,
    public player3id: string,
    public player4id: string,
    public beganAt: Date,
    public endedAt?: Date,
    public name?: string,
  ) {}
}
