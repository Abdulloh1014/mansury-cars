import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { ViewService } from './components/view/view.service';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot(),     // .env ni o‘qib, konfiguratsiyani global qiladi
    GraphQLModule.forRoot({     // GraphQL serverni ishga tushiradi
      driver: ApolloDriver,     // Apollo GraphQL engine ishlatiladi
      playground: true,         // brauzerda GraphQL test oynasini yoqadi.
      uploads: false,           // fayl upload’ni o‘chiradi.
      autoSchemaFile: true,     // GraphQL schema’ni avtomatik generatsiya qiladi.
      formatError: (error: T) => {      // formatError xatoni custom tarzda qayta ishlash funksiyasi.
        const graphQLFormattedError = {
          code: error?.extensions.code,
          message: 
            error?.extensions?.exception?.response?.message || 
            error?.extensions?.response?.message || 
            error?.message,
        };
        console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
        return graphQLFormattedError;
      },
    }),
    ComponentsModule, //HTTP
    DatabaseModule,  //TCP
    SocketModule,     //TCP
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver], 
})
export class AppModule {}
