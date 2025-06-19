import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

type Location = "hat" | "left" | "right";

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  price: number;

  @Column({
    type: "enum",
    enum: ["hat", "left", "right"],
  })
  location: Location;

  constructor(
    id: number,
    name: string,
    icon: string,
    price: number,
    location: Location,
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.price = price;
    this.location = location;
  }
}
