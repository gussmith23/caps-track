import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Font {

  @PrimaryColumn("number")
  id: string

  @Column()
  name: string

  @Column()
  size?: string

  constructor(id: string, name: string, size?: string) {
    this.id = id;
    this.name = name;
    this.size = size;
  }
}


