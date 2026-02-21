
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { CarColor, CarFuelType, CarLocation, CarStatus, CarType } from '../../enums/car.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';


@ObjectType()
export class Car {
  @Field(() => String)     //@Field — car’ni GraphQL maydoniga aylantiradi.
  _id: ObjectId;

   @Field(() => CarType)
  carType: CarType;

   @Field(() => CarStatus)
  carStatus: CarStatus;

   @Field(() => CarLocation)
  carLocation: CarLocation;

   @Field(() => String)
  carTitle: string;

   @Field(() => Number)
  carPrice: number;



   @Field(() => Int)
  carMileage: number;

   @Field(() => CarFuelType)
  carFuelType: CarFuelType;

   @Field(() => Int)
  carDoors: number;

   @Field(() => Number)
  carYear: number;

   @Field(() => CarColor)
  carColor: CarColor;

   @Field(() => Number)
  carEngine: number;



   @Field(() => Int)
  carViews: number;

   @Field(() => Int)
  carLikes: number;

   @Field(() => Int)
  carComments: number;

   @Field(() => Int)
  carRank: number;

  @Field(() => [String])
  carImages: string[];

  @Field(() => String, { nullable: true })
  carDesc?: string;

  @Field(() => Boolean)
  carBarter: boolean;

  @Field(() => Boolean)
  carRent: boolean;

  @Field(() => String)
  memberId: ObjectId;

   @Field(() => Date, {nullable: true})
  soldAt?: Date;

   @Field(() => Date, {nullable: true})
  deletedAt?: Date;

   @Field(() => Date, {nullable: true})
  constructedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /** From Agrigation */
  
  @Field(() => [MeLiked], {nullable: true})
  meLiked?: MeLiked[];

  @Field(() => Member, {nullable: true})
  memberData?: Member;


}


@ObjectType()
export class CarList {
  @Field(() => [Car]) 
  list: Car[];

  @Field(() => [TotalCounter], {nullable: true})
  metaCounter: TotalCounter[];
}


