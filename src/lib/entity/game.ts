import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { type PlayerEntity, type PlayerObject } from "./player";
import { type PointEntity, type PointObject } from "./point";

export type GameObject = {
  id: string;
  players?: PlayerObject[];
  points?: PointObject[];
  beganAt: Date;
  endedAt?: Date;
  name?: string;
};

@Entity({ name: "game" })
export class GameEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: string;

  @ManyToMany("PlayerEntity")
  @JoinTable()
  players!: PlayerEntity[];

  @OneToMany("PointEntity", (point: PointEntity) => point.game)
  points!: PointEntity[];

  @Column({ type: "timestamp with time zone" })
  beganAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  endedAt?: Date;

  @Column({ nullable: true })
  name?: string;
}
