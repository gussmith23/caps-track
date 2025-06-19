import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FontEntity } from "./font";
import { Item } from "./item";

export type PlayerObject = {
  id: number;
  name: string;
  nameColor?: string;
  font?: FontEntity;
  fontWeight?: string;
  unlockedItems?: Item[];
  equippedItem?: Item[];
};

@Entity({ name: "player" })
export class PlayerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  @Column()
  nameColor?: string;

  @ManyToOne(() => FontEntity, {
    eager: true,
    cascade: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  font?: FontEntity;

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
    font?: FontEntity,
    fontWeight?: string,
    unlockedItems?: Item[],
    equippedItems?: Item[],
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
