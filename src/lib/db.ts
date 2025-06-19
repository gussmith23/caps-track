import "reflect-metadata";
import { DataSource } from "typeorm";
import { FontEntity } from "./entity/font";
import { PointEntity } from "./entity/point";
import { GameEntity } from "./entity/game";
import { PlayerEntity } from "./entity/player";
import { Item } from "./entity/item";
import config from "./config";

const AppDataSource = new DataSource({
  type: "postgres",
  host: config.dbHostname,
  port: config.dbPort,
  username: config.dbUsername,
  password: config.dbPassword,
  database: config.dbName,
  entities: [PointEntity, FontEntity, GameEntity, PlayerEntity, Item],
  synchronize: true,
  logging: true,
});

// TODO(@gussmith23): not sure where to put this in nextjs.
await AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
  })
  .catch((error) => console.log(error));

export { AppDataSource };
