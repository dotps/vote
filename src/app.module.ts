import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './users/users.controller'
import { databaseProvider } from './providers/database.provider';


@Module({
  imports: [
    databaseProvider
  ],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
