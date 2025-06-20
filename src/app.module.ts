import {Module} from "@nestjs/common"
import {databaseProvider} from "./libs/providers/database.provider"
import {configModule} from "./libs/config/config"
import {UserModule} from "./modules/users/user.module"
import {AuthModule} from "./modules/auth/auth.module"
import {APP_GUARD} from "@nestjs/core"
import {AuthGuard} from "./modules/auth/auth.guard"
import {SurveysModule} from "./modules/surveys/survey/surveys.module"

@Module({
    imports: [
        configModule,
        databaseProvider,
        AuthModule,
        UserModule,
        SurveysModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})

export class AppModule {
}
