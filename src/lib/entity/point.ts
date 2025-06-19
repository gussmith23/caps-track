import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlayerEntity, type PlayerObject } from "./player";
import { GameEntity, type GameObject } from "./game";

export interface PointObject {
  id: number;
  game: GameObject;
  player: PlayerObject;
  datetime: Date;
}

@Entity({ name: "point" })
export class PointEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  public id: number;

  @ManyToOne(() => GameEntity, (game: GameEntity) => game.points)
  public game: GameEntity;

  @ManyToOne(() => PlayerEntity, {
    eager: true,
  })
  public player: PlayerEntity; // Placeholder for Player entity, should be replaced with actual type

  @Column({ type: "timestamp with time zone" })
  public datetime: Date;
  constructor(
    id: number,
    game: GameEntity,
    player: PlayerEntity,
    datetime: Date,
  ) {
    this.id = id;
    this.game = game;
    this.player = player;
    this.datetime = datetime;
  }
}
