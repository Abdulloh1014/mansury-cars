import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AgentCarsInquiry, AllCarsInquiry, OrdinaryInquiry, CarsInquiry, CarInput } from '../../libs/dto/car/car.input';
import { CarList, Car } from '../../libs/dto/car/car';
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
    constructor(@InjectModel('Car') private readonly carModel: Model<Car>,
      private memberService: MemberService,
      private viewService: ViewService,
      private likeService: LikeService
   ) {}

   public async createCar(input: CarInput): Promise<Car>{ 
    try{
      const result = await this.carModel.create(input);
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


   public async getCar(memberId: ObjectId, carId: ObjectId): Promise<Car> {
    const search: T = {
      _id: carId,    // biz ko'rmoqschi bo‘lgan carId
      carStatus: CarStatus.ACTIVE, // faqat ACTIVE holatdagi carlarni ko‘rsatilishi kerak
    };

    const targetCar: Car = await this.carModel.findOne(search).lean().exec();
    // lean() → Mongoose hujjatini oddiy JS object qilib beradi. Bu o‘qish tezligini oshiradi va xotira sarfini kamaytiradi.
    if(!targetCar) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
 
    if(memberId) {
      const viewInput = { 
        memberId: memberId,               // kim ko‘rdi
        viewRefId: carId,            // qaysi car ko‘rildi
        viewGroup: ViewGroup.CAR};   // qaysi tur (CAR)
      const newView = await this.viewService.recordView(viewInput);
      if(newView) {
        await this.carStatsEditor({ _id: carId, targetKey: 'carViews', modifier: 1});
        targetCar.carViews++;
      }

      // meLiked
            const likeInput = {memberId: memberId, likeRefId: carId, likeGroup: LikeGroup.CAR};
            targetCar.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    targetCar.memberData = await this.memberService.getMember(null, targetCar.memberId);
    return targetCar;

   }

   

   public async updateCar(memberId: ObjectId, input: CarUpdate): Promise<Car> {
    let { carStatus, soldAt, deletedAt } = input;
    const search: T = {
      _id: input._id,       // yangilamoqchi bo‘lgan carId
      memberId: memberId,   // kirib kelyotgan agent o‘zining carsini yangilashi mumkin
      carStatus: CarStatus.ACTIVE,   // faqat ACTIVE holatdagi carlarni yangilashi mumkin
    };

    if (carStatus === CarStatus.SOLD ) soldAt = moment().toDate();
    // agar carStatus SOLD ga o‘zgartirilsa, soldAt maydonini hozirgi sana bilan to‘ldirish
    
    else if ( carStatus === CarStatus.DELETE) deletedAt = moment().toDate();
    // agar carStatus DELETE ga o‘zgartirilsa, deletedAt maydonini hozirgi sana bilan to‘ldirish

    const result = await this.carModel
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


  public async getProperties (memberId: ObjectId, input: CarsInquiry): Promise<CarList> {
    const match: T = {carStatus: CarStatus.ACTIVE};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    this.shapeMatchQuery(match, input)
    console.log('match:', match)

    const result = await this.carModel
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

  private shapeMatchQuery(match: T, input: CarsInquiry): void {
  const {
    memberId,
    locationList,
    doorsList,
    fuelTypeList,
    typeList,
    periodsRange,
    pricesRange,
    mileageRange,
    options,
    text,
  } = input.search;

  if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
  if (locationList && locationList.length) match.carLocation = { $in: locationList };
  if (doorsList && doorsList.length) match.carDoors = { $in: doorsList };
  if (fuelTypeList && fuelTypeList.length) match.carFuelType = { $in: fuelTypeList };
  if (typeList && typeList.length) match.carType = { $in: typeList };
  
  if (pricesRange) match.carPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
  if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
  if (mileageRange) match.carMileage = { $gte: mileageRange.start, $lte: mileageRange.end };
  if (text) match.carTitle = { $regex: new RegExp(text, 'i') };
  if (options) {
    match['$or'] = options.map((ele) => {
      return { [ele]: true };
    });
  }
}

public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<CarList> {
  return await this.likeService.getFavoriteProperties(memberId, input)
}

public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<CarList> {
  return await this.viewService.getVisitedProperties(memberId, input)
}


public async getAgentProperties(memberId: ObjectId, input: AgentCarsInquiry): Promise<CarList> {
  const { carStatus } = input.search;
  if (carStatus === CarStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

  const match: T = {
    memberId: memberId,
    carStatus: carStatus ?? { $ne: CarStatus.DELETE }, 
  };
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

  const result = await this.carModel
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
    const target: Car = await this.carModel
    .findOne({ _id: likeRefId, carStatus: CarStatus.ACTIVE })
    .exec();
    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
        memberId: memberId,
        likeRefId: likeRefId,
        likeGroup: LikeGroup.CAR,
    };


    // LIKE TOGGLE via Like Modules
    const modifier : number = await this.likeService.toggleLike(input);
    const result = await this.carStatsEditor({ _id: likeRefId, targetKey: 'carLikes', modifier: modifier });
    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG)
        return result;
    
   }




/** ADMIN  **/

public async getAllPropertiesByAdmin(input: AllCarsInquiry): Promise<CarList> {
  const { carStatus, carLocationList } = input.search;
  const match: T = {};
  const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

  if (carStatus) match.carStatus = carStatus;
  if (carLocationList) match.carLocation = { $in: carLocationList};

  const result = await this.carModel
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
  let { carStatus, soldAt, deletedAt } = input;
  const search: T = {
    _id: input._id,
    carStatus: CarStatus.ACTIVE,
  };

  if (carStatus === CarStatus.SOLD) soldAt = moment().toDate();
  else if (carStatus === CarStatus.DELETE) deletedAt = moment().toDate();

  const result = await this.carModel.
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


public async removeCarByAdmin(carId: ObjectId): Promise<Car> {
  const search: T = { _id: carId, carStatus: CarStatus.DELETE };
  const result = await this.carModel.findOneAndDelete(search).exec();
  if(!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

  return result;
}


public async carStatsEditor(input: StatisticModifier): Promise<Car> {
    const { _id, targetKey, modifier } = input;
    return await this.carModel
       .findByIdAndUpdate(
        _id,
        { $inc: { [targetKey]: modifier } },

        { new: true, },
       )
       .exec();
   }


}


