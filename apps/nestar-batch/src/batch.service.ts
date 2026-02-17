import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/nestar-api/src/libs/dto/member/member';
import { Car } from 'apps/nestar-api/src/libs/dto/ptoperty/car';
import { MemberStatus, MemberType } from 'apps/nestar-api/src/libs/enums/member.enum';
import { CarStatus } from 'apps/nestar-api/src/libs/enums/car.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel('Car') private readonly carModel: Model<Car>,
    @InjectModel('Member') private readonly memberModel: Model<Member>
  ){}
  
  public async batchRollback(): Promise<void> {
    await this.carModel
      .updateMany(
        {
          carStatus: CarStatus.ACTIVE,
        },
        { carRank: 0 },
      )
       .exec();

       await this.memberModel
         .updateMany(
          {
            memberStatus: MemberStatus.ACTIVE,
            memberType: MemberType.AGENT,
          },
          { memberRank: 0 },
         )
         .exec();
  }
  
  public async batchTopProperties(): Promise<void> {
    const properties: Car[] = await this.carModel
    .find({
      carStatus: CarStatus.ACTIVE,
      carRank: 0,
    })
    .exec();

    const promisedList = properties.map(async (ele: Car) => {
      const { _id, carLikes, carViews } = ele;
      const rank = carLikes * 2 + carViews * 1;
      return await this.carModel.findByIdAndUpdate(_id, { carRank: rank });
    });
    await Promise.all(promisedList);
    
  }
  
  public async batchTopAgents(): Promise<void> {
    const agents: Member[] = await this.memberModel
    .find(
      {
        memberType: MemberType.AGENT,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

      const promisedList = agents.map(async (ele: Member) => {
        const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
        const rank = memberProperties * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
        return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
      });
      await Promise.all(promisedList);
      
    }
    
  
  public getHello(): string {
    return 'Welcome to Nestar BATCH server!';
  }


}
