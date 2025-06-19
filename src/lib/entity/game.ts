import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./player";
import { Point } from "./point";

export type GameObject = {
  id: string;
  players?: { id: string }[];
  points?: "PointObject"[];
  beganAt: Date;
  endedAt?: Date;
  name?: string;
};

@Entity()
export class GameEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: string;

  @ManyToMany("Player")
  @JoinTable()
  players!: Player[];

  @OneToMany(() => Point, (point) => point.game)
  points!: Point[];

  @Column({ type: "timestamp with time zone" })
  beganAt!: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  endedAt?: Date;

  @Column({ nullable: true })
  name?: string;
}
