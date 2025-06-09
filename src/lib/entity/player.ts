import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Font } from "./font";
import { Item } from "./item";

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @Column()
  nameColor?: string;

  @ManyToOne(() => Font, { eager: true, cascade: true, onDelete: "SET NULL" })
  @JoinColumn()
  font?: Font;

  @Column()
  fontWeight?: string;

  @ManyToMany(() => Item, { eager: true, cascade: true, onDelete: "SET NULL" })
  @JoinTable()
  unlockedItems?: Item[];

  @ManyToMany(() => Item, { eager: true, cascade: true, onDelete: "SET NULL" })
  @JoinTable()
  equippedItem?: Item[];

  constructor(
    id: number,
    name: string,
    nameColor?: string,
    font?: Font,
    fontWeight?: string,
    unlockedItems?: Item[],
    equippedItems?: Item[]
  ) {
    this.id = id;
    this.name = name;
    this.nameColor = nameColor;
    this.font = font;
    this.fontWeight = fontWeight;
    this.unlockedItems = unlockedItems;
    this.equippedItem = equippedItems;
  }
}
