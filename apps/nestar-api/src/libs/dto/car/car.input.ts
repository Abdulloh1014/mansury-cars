import { Field, InputType, Int } from "@nestjs/graphql";
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator'
import { CarColor, CarFuelType, CarLocation, CarStatus, CarType } from "../../enums/car.enum";
import { ObjectId } from "mongoose";
import { availableOptions, availableCarSorts } from "../../config";
import { Direction } from "../../enums/common.enum";


@InputType()
export class CarInput {
   
    @IsNotEmpty()
    @Field(() => CarType)
    carType: CarType;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Field(() => Int)
    carPrice: number;

    @IsNotEmpty()
    @Field(() => CarLocation)
    carLocation: CarLocation;

    @IsNotEmpty()
    @Length(3, 100)
    @Field(() => String)
    carTitle: string;



    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Field(() => Int)
    carMileage: number;

    @IsNotEmpty()
    @Field(() => CarFuelType)
    carFuelType: CarFuelType;

    @IsNotEmpty()
    @IsInt()
    @Field(() => Int)
    carDoors: number;

    @IsNotEmpty()
    @Field(() => Number)
    carYear: number;

    @IsNotEmpty()
    @Field(() => CarColor)
    carColor: CarColor;

    @IsNotEmpty()
    @Field(() => Number)
    carEngine: number;

   


    @IsNotEmpty()
    @Field(() => [String])
    carImages: string[];

    @IsOptional()
    @Length(5, 100)
    @Field(() => String, {nullable: true})
    carDesc?: string;

    @IsOptional()
    @Field(() => Boolean, {nullable: true})
    carBarter?: boolean;

    @IsOptional()
    @Field(() => Boolean, {nullable: true})
    carRent?: boolean;

    memberId?: ObjectId;   // type lar crach bolmasligi uchun, 

    @IsOptional()
    @Field(() => Date, {nullable: true})
    constructedAt?: Date;

}

@InputType()
export class PricesRange {
    @Field(() => Int)
    start: number;

    @Field(() => Int)
    end: number;
}

@InputType()
export class MileageRange {
    @Field(() => Int)
    start: number;

    @Field(() => Int)
    end: number;
}

@InputType()
export class PeriodsRange {
    @Field(() => Date)
    start: Date;

    @Field(() => Date)
    end: Date;
}


@InputType()
export class PISearch {
    @IsOptional()
    @Field(() => String, {nullable: true})
    memberId: ObjectId;

    @IsOptional()
    @Field(() => [CarLocation], {nullable: true})
    locationList?: CarLocation[];

    @IsOptional()
    @Field(() => [CarType], {nullable: true})
    typeList?: CarType[];

    @IsOptional()
    @Field(() => [Int], {nullable: true})
    doorsList?: number[]; // seatsList o'rniga eshiklar soni filtri

   
    @IsOptional()
    @Field(() => [CarFuelType], {nullable: true}) // String emas, Enum list!
    fuelTypeList?: CarFuelType[];

    @IsOptional()
    @IsIn(availableOptions, {each: true})
    @Field(() => [String], {nullable: true})
    options?: string[];

    @IsOptional()
    @Field(() => PricesRange, {nullable: true})
    pricesRange?: PricesRange;

    @IsOptional()
    @Field(() => PeriodsRange, {nullable: true})
    periodsRange?: PeriodsRange;

    @IsOptional()
    @Field(() => MileageRange, {nullable: true})
    mileageRange?: MileageRange;

    
    @IsOptional()
    @Field(() => String, {nullable: true})
    text?: string;
    

  
}




  @InputType()
    export class CarsInquiry {
        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        page: number;

       
        @IsNotEmpty()
        @Min(1)
        @Field(() => Int)
        limit: number;

        @IsOptional()
        @IsIn(availableCarSorts)
        @Field(() => String, {nullable: true})
        sort?: string;

        @IsOptional()
        @Field(() => Direction, {nullable: true})
        direction?: Direction;

        @IsNotEmpty()
        @Field(() => PISearch)
        search: PISearch;

    }

    @InputType()
    class APISearch {
        @IsOptional()
        @Field(() => CarStatus, {nullable: true})
        carStatus?: CarStatus;
    }

    @InputType()
    export class AgentCarsInquiry {
        @IsNotEmpty()
        @Min(1)
        @Field(() =>Int)
        page: number;

        
        @IsNotEmpty()
        @Min(1)
        @Field(() =>Int)
        limit: number;

        @IsOptional()
        @IsIn(availableCarSorts)
        @Field(() => String, {nullable: true})
        sort?: string;

        @IsOptional()
        @Field(() => Direction, {nullable: true})
        direction?: Direction;

        @IsOptional()
        @Field(() => APISearch)
        search: APISearch;
    }


     @InputType()
    class ALPISearch {
        @IsOptional()
        @Field(() => CarStatus, {nullable: true})
        carStatus?: CarStatus;

        @IsOptional()
        @Field(() => [CarLocation], {nullable: true})
        carLocationList?: CarLocation[];
    }

    @InputType()
    export class AllCarsInquiry {
         @IsNotEmpty()
         @Min(1)
         @Field(() => Int)
         page: number;

         @IsNotEmpty()
         @Min(1)
         @Field(() => Int)
         limit: number;

         @IsOptional()
         @IsIn(availableCarSorts)
         @Field(() => String, { nullable: true })
         sort?: string;

        @IsOptional()
        @Field(() => Direction, {nullable: true})
        direction?: Direction;

        @IsNotEmpty()
        @Field(() => ALPISearch)
        search: ALPISearch;

    }


    @InputType()
    export class OrdinaryInquiry {
         @IsNotEmpty()
         @Min(1)
         @Field(() => Int)
         page: number;

         @IsNotEmpty()
         @Min(1)
         @Field(() => Int)
         limit: number;

        
    }





       






   

