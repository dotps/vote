import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {databaseProvider} from "./providers/database.provider"
import {configModule} from "./config/config"
import {UserModule} from "./users/user.module"
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        configModule,
        databaseProvider,
        AuthModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})

export class AppModule {}
