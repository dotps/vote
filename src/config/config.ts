import {ConfigModule} from "@nestjs/config"

export const config = ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true,
})