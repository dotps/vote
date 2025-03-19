import {Module} from "@nestjs/common"
import {AppController} from "./app.controller"
import {AppService} from "./app.service"
import {databaseProvider} from "./providers/database.provider"
import {configModule} from "./config/config"
import {UserModule} from "./users/user.module"
import {AuthModule} from "./auth/auth.module"
import {APP_GUARD} from "@nestjs/core"
import {AuthGuard} from "./auth/auth.guard"
import {SurveysModule} from "./surveys/surveys.module"

@Module({
    imports: [
        configModule,
        databaseProvider,
        AuthModule,
        UserModule,
        SurveysModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})

export class AppModule {
}
