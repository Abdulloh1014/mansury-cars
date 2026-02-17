import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CarService } from './car.service';
import { Properties, Car } from '../../libs/dto/car/car';
import { AgentPropertiesInquiry, AllPropertiesInquiry, OrdinaryInquiry, PropertiesInquiry, CarInput } from '../../libs/dto/car/car.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { CarUpdate } from '../../libs/dto/car/car.update';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class CarResolver {
        constructor(private readonly propertyService: CarService) {}
   
        @Roles(MemberType.AGENT)
        @UseGuards(RolesGuard)
        @Mutation(() => Car)
        public async createCar(
        @Args('input') input: CarInput, 
        @AuthMember('_id') memberId: ObjectId): Promise<Car> {
            console.log("Mutation: createCar");
            input.memberId = memberId;
            return await this.propertyService.createCar(input);
      }


      @UseGuards(WithoutGuard)
      @Query((returns) => Car)
      public async getCar(
        @Args('propertyId') input: string,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Car> {
        console.log('Query: getCar');
        const propertyId = shapeIntoMongoObjectId(input);
        return await this.propertyService.getCar(memberId, propertyId);
      }

      @Roles(MemberType.AGENT)
      @UseGuards(RolesGuard)
      @Mutation((returns) => Car)
      public async updateCar(
        @Args('input') input: CarUpdate,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Car> {
        console.log('Mutation: updateCar');
        input._id = shapeIntoMongoObjectId(input._id);
        return await this.propertyService.updateCar(memberId, input)
      }


      @UseGuards(WithoutGuard)
      @Query((returns) => Properties)
      public async getProperties(
        @Args('input') input: PropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Properties> {
        console.log('Query: getProperties');
        return await this.propertyService.getProperties(memberId, input)
      }

      @UseGuards(AuthGuard)
      @Query((returns) => Properties)
      public async getFavorites(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Properties> {
        console.log('Query: getFavorites');
        return await this.propertyService.getFavorites(memberId, input)
      }

      @UseGuards(AuthGuard)
      @Query((returns) => Properties)
      public async getVisited(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Properties> {
        console.log('Query: getVisited');
        return await this.propertyService.getVisited(memberId, input)
      }


      @Roles(MemberType.AGENT)
      @UseGuards(RolesGuard)
      @Query((returns) => Properties)
      public async getAgentProperties(
        @Args('input') input: AgentPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Properties> {
        console.log("Query: getAgentProperties");
        return await this.propertyService.getAgentProperties(memberId, input);
      }



     @UseGuards(AuthGuard)
     @Mutation(() => Car)
     public async likeTargetCar(
        @Args('propertyId') input: string,
        @AuthMember('_id') memberId: ObjectId,
     ): Promise<Car> {
        console.log("Mutation: likeTargetCar");
        const likeRefId = shapeIntoMongoObjectId(input);
        return await this.propertyService.likeTargetCar(memberId, likeRefId);
     }




      /** ADMIN */

      @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Query((returns) => Properties)
      public async getAllPropertiesByAdmin(
        @Args('input') input: AllPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
      ): Promise<Properties> {
        console.log("Query: getAllPropertiesByAdmin")
        return await this.propertyService.getAllPropertiesByAdmin(input);
      }


       @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Mutation((returns) => Car)
      public async updateCarByAdmin(
        @Args('input') input: CarUpdate): Promise<Car> {
        console.log("Mutation: updateCarByAdmin");
        input._id = shapeIntoMongoObjectId(input._id)
        return await this.propertyService.updateCarByAdmin(input);
      }


       @Roles(MemberType.ADMIN)
      @UseGuards(RolesGuard)
      @Mutation((returns) => Car)
      public async removeCarByAdmin(
        @Args('propertyId') input: string): Promise<Car> {
        console.log("Mutation: removeCarByAdmin");
        const propertyId = shapeIntoMongoObjectId(input)
        return await this.propertyService.removeCarByAdmin(propertyId);
      }

}
