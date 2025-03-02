import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {databaseProvider} from "./providers/database.provider"
import {config} from "./config/config"
import {UserModule} from "./users/user.module"

@Module({
    imports: [
        config,
        databaseProvider,
        UserModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})

export class AppModule {}
