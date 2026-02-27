import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from "class-validator";
import { ObjectId } from "mongoose";
import { CarColor, CarFuelType, CarLocation, CarStatus, CarType } from "../../enums/car.enum";




@InputType()
export class CarUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id: ObjectId;

    @IsOptional()
    @Field(() => CarType, { nullable: true })
    carType?: CarType;

    @IsOptional()
    @Field(() => CarStatus, { nullable: true })
    carStatus?: CarStatus;

    @IsOptional()
    @Field(() => CarLocation, { nullable: true })
    carLocation?: CarLocation;

    @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    carTitle?: string;

    @IsOptional()
    @Field(() => Number, { nullable: true })
    carPrice?: number;



    @IsOptional()
    @IsInt()
    @Min(0)
    @Field(() => Number, { nullable: true })
    carMileage?: number;

    @IsOptional()
    @Field(() => CarFuelType, { nullable: true})
    carFuelType?: CarFuelType;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Field(() => Int, { nullable: true})
    carDoors?: number;

    @IsOptional()
    @Field(() => Number, { nullable: true })
    carYear?: number;

    @IsOptional()
    @Field(() => CarColor, { nullable: true })
    carColor?: CarColor;

    @IsOptional()
    @Field(() => Number, { nullable: true })
    carEngine?: number;




    @IsOptional()
    @Field(() => [String], { nullable: true })
    carImages?: string[];

    @IsOptional()
    @Length(5, 100)
    @Field(() => String, { nullable: true })
    carDesc?: string;

    @IsOptional()
    @Field(() => Boolean, { nullable: true })
    carBarter?: boolean;

    @IsOptional()
    @Field(() => Boolean, { nullable: true })
    carRent?: boolean;

    soldAt?: Date;

    deletedAt?: Date;

    @IsOptional()
    @Field(() => Date, { nullable: true })
    constructedAt?: Date;



    

    




}
