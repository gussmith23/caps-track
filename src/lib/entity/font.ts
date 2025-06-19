import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "font" })
export class FontEntity {
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
