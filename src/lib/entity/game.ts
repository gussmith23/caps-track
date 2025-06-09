import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Game {
  @PrimaryColumn({ type: "number" })
  id: string;


  // @OneToMany()
  // players: Player[];

  @Column({ type: "timestamp with time zone" })
  beganAt: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  endedAt?: Date;

  @Column()
  name?: string;

  constructor(id: string, beganAt: Date, endedAt?: Date, name?: string) {
    this.id = id;
    this.beganAt = beganAt;
    this.endedAt = endedAt;
    this.name = name;
  }
}
