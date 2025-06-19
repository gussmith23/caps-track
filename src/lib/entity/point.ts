import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Game } from "./game";
import { Player } from "./player";

@Entity()
export class Point {
  @PrimaryGeneratedColumn({ type: "integer" })
  public id: number;

  @ManyToOne("Game", (game) => game.points)
  public game: Game; // Placeholder for Game entity, should be replaced with actual type

  @ManyToOne("Player", {
    eager: true,
  })
  public player: Player; // Placeholder for Player entity, should be replaced with actual type

  @Column({ type: "timestamp with time zone" })
  public datetime: Date;
  constructor(id: number, game: Game, player: Player, datetime: Date) {
    this.id = id;
    this.game = game;
    this.player = player;
    this.datetime = datetime;
  }
}
