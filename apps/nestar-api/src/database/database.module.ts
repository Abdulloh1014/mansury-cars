import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from "@nestjs/mongoose";
import { Connection } from 'mongoose';

@Module({
    imports: [                                // forRootAsync — MongoDB ga asinxron ulanish uchun.
        MongooseModule.forRootAsync({       // MongooseModule. NestJS ↔ MongoDB orasidagi bog‘lovchi
            useFactory: () => ({           // sozlamani runtime’da yasash
                uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV,
            }),
        }),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule {
    constructor (@InjectConnection() private readonly connection: Connection) {     //  @InjectConnection()                                                                                               
        if (connection.readyState === 1) {                                         //   Mongoose ochib bo‘lgan MongoDB connection ni oladi
            console.log(
                `MongoDB is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db`
            )
        } else {
            console.log('DB is not connected!')
        }
    }
}


/**
 * readyState nimani bildiradi?

Mongoose’da connection holati raqam bilan beriladi:

0 → ulanmagan

1 → ulangan ✅

2 → ulanmoqda

3 → uzilmoqda */