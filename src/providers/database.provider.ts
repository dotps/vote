import { TypeOrmModule } from "@nestjs/typeorm";

export const databaseProvider = TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  entities: [],
  synchronize: true,
})
// TODO: продолжить
// https://docs.nestjs.com/techniques/database