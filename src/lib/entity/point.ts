import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./player";

export type PointObject = {
  id: number;
  game: "GameObject";
  player: "PlayerObject";
  datetime: Date;
};

@Entity()
export class Point {
  @PrimaryGeneratedColumn({ type: "integer" })
  public id: number;

  @ManyToOne("GameEntity", (game: "GameEntity") => game.points)
  public game: "GameEntity"; // Placeholder for Game entity, should be replaced with actual type

  @ManyToOne("Player", {
    eager: true,
  })
  public player: Player; // Placeholder for Player entity, should be replaced with actual type

  @Column({ type: "timestamp with time zone" })
  public datetime: Date;
  constructor(id: number, game: GameEntity, player: Player, datetime: Date) {
    this.id = id;
    this.game = game;
    this.player = player;
    this.datetime = datetime;
  }
}
