import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Font {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  size?: string;

  constructor(id: number, name: string, size?: string) {
    this.id = id;
    this.name = name;
    this.size = size;
  }
}
