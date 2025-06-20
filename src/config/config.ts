import {ConfigModule} from "@nestjs/config"

export const configModule = ConfigModule.forRoot({
    envFilePath: ".env",
    isGlobal: true,
})

export enum Config {
    AppPort = "APP_PORT",
    DatabaseUrl = "DATABASE_URL",
    JwtSecret = "JWT_SECRET",
    JwtExpires = "JWT_EXPIRES",
}