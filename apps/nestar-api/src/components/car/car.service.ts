import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AgentPropertiesInquiry, AllPropertiesInquiry, OrdinaryInquiry, PropertiesInquiry, CarInput } from '../../libs/dto/car/car.input';
import { Properties, Car } from '../../libs/dto/car/car';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { CarStatus } from '../../libs/enums/car.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { CarUpdate } from '../../libs/dto/car/car.update';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { MemberStatus } from '../../libs/enums/member.enum';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class CarService {
  Car(): Car | PromiseLike<Car> {
    throw new Error('Method not implemented.');
  }
    constructor(@InjectModel('Car') private readonly propertyModel: Model<Car>,
      private memberService: MemberService,
      private viewService: ViewService,
      private likeService: LikeService
   ) {}

   public async createCar(input: CarInput): Promise<Car>{ 
    try{
      const result = await this.propertyModel.create(input);
      // increase memberProperties +1
      await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberProperties',
        modifier: 1,
      })
      return result;

     } catch (err) {
    console.log('Error, Service.model:', err.message);
       throw new BadRequestException(Message.CREATE_FAILED);
     }
   }


   public async getCar(memberId: ObjectId, propertyId: ObjectId): Promise<Car> {
    const search: T = {
      _id: propertyId,    // biz ko'rmoqschi bo‘lgan propertyId
      propertyStatus: CarStatus.ACTIVE, // faqat ACTIVE holatdagi propertylarni ko‘rsatilishi kerak
    };

    const targetCar: Car = await this.propertyModel.findOne(search).lean().exec();
    // lean() → Mongoose hujjatini oddiy JS object qilib beradi. Bu o‘qish tezligini oshiradi va xotira sarfini kamaytiradi.
    if(!targetCar) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
 
    if(memberId) {
      const viewInput = { 
        memberId: memberId,               // kim ko‘rdi
        viewRefId: propertyId,            // qaysi car ko‘rildi
        viewGroup: ViewGroup.PROPERTY};   // qaysi tur (PROPERTY)
      const newView = await this.viewService.recordView(viewInput);
      if(newView) {
        await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1});
        targetCar.propertyViews++;
      }

      // meLiked
            const likeInput = {memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY};
            targetCar.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    targetCar.memberData = await this.memberService.getMember(null, targetCar.memberId);
    return targetCar;

   }

   

   public async updateCar(memberId: ObjectId, input: CarUpdate): Promise<Car> {
    let { propertyStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,       // yangilamoqchi bo‘lgan propertyId
      memberId: memberId,   // kirib kelyotgan agent o‘zining propertysini yangilashi mumkin
      propertyStatus: CarStatus.ACTIVE,   // faqat ACTIVE holatdagi propertylarni yangilashi mumkin
    };

    if (propertyStatus === CarStatus.SOLD ) soldAt = moment().toDate();
    // agar propertyStatus SOLD ga o‘zgartirilsa, soldAt maydonini hozirgi sana bilan to‘ldirish
    
    else if ( propertyStatus === CarStatus.DELETE) deletedAt = moment().toDate();
    // agar propertyStatus DELETE ga o‘zgartirilsa, deletedAt maydonini hozirgi sana bilan to‘ldirish

    const result = await this.propertyModel
    .findByIdAndUpdate(search, input, {
      new: true,
    })
    .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (soldAt || deletedAt) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberProperties',
        modifier: -1
      });
    }

    return result;
  }


  public async getProperties (memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
    const match: T = {propertyStatus: CarStatus.ACTIVE};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    this.shapeMatchQuery(match, input)
    console.log('match:', match)

    const result = await this.propertyModel
       .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },   //pajination
              // meLiked
              lookupAuthMemberLiked(memberId),
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
       ])
       .exec();
     if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

     return result[0];
  }

  private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
  const {
    memberId,
    locationList,
    roomsList,
    bedsList,
    typeList,
    periodsRange,
    pricesRange,
    squaresRange,
    options,
    text,
  } = input.search;

  if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
  if (locationList && locationList.length) match.propertyLocation = { $in: locationList };
  if (roomsList && roomsList.length) match.propertyRooms = { $in: roomsList };
  if (bedsList && bedsList.length) match.propertyBeds = { $in: bedsList };
  if (typeList && typeList.length) match.propertyType = { $in: typeList };
  
  if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
  if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
  if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };
  if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
  if (options) {
    match['$or'] = options.map((ele) => {
      return { [ele]: true };
    });
  }
}

public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
  return await this.likeService.getFavoriteProperties(memberId, input)
}

public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
  return await this.viewService.getVisitedProperties(memberId, input)
}


public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
  const { propertyStatus } = input.search;
  if (propertyStatus === CarStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

  const match: T = {
    memberId: memberId,
    propertyStatus: propertyStatus ?? { $ne: CarStatus.DELETE }, 
  };
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

  const result = await this.propertyModel
       .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
       ])
       .exec();
     if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

     return result[0];

}


public async likeTargetCar(memberId: ObjectId, likeRefId: ObjectId): Promise<Car> {
    const target: Car = await this.propertyModel
    .findOne({ _id: likeRefId, propertyStatus: CarStatus.ACTIVE })
    .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
        memberId: memberId,
        likeRefId: likeRefId,
        likeGroup: LikeGroup.PROPERTY,
    };


    // LIKE TOGGLE via Like Modules
    const modifier : number = await this.likeService.toggleLike(input);
    const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'propertyLikes', modifier: modifier });
    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)
        return result;
    
   }




/** ADMIN  **/

public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
  const { propertyStatus, propertyLocationList } = input.search;
  const match: T = {};
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

  if (propertyStatus) match.propertyStatus = propertyStatus;
  if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList};

  const result = await this.propertyModel
       .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
       ])
       .exec();
     if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

     return result[0];

  
}


public async updateCarByAdmin(input: CarUpdate): Promise<Car> {
  let { propertyStatus, soldAt, deletedAt } = input;
  const search: T = {
    _id: input._id,
    propertyStatus: CarStatus.ACTIVE,
  };

  if (propertyStatus === CarStatus.SOLD) soldAt = moment().toDate();
  else if (propertyStatus === CarStatus.DELETE) deletedAt = moment().toDate();

  const result = await this.propertyModel.
  findOneAndUpdate(search, input, {
    new: true,
  })
  .exec();
  if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

  if (soldAt || deletedAt) {
    await this.memberService.memberStatsEditor({
      _id: result.memberId,
      targetKey: 'memberProperties',
      modifier: -1,
    });
  }

  return result;

}


public async removeCarByAdmin(propertyId: ObjectId): Promise<Car> {
  const search: T = { _id: propertyId, propertyStatus: CarStatus.DELETE };
  const result = await this.propertyModel.findOneAndDelete(search).exec();
  if(!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

  return result;
}


public async propertyStatsEditor(input: StatisticModifier): Promise<Car> {
    const { _id, targetKey, modifier } = input;
    return await this.propertyModel
       .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },

        { new: true, },
       )
       .exec();
   }


}


