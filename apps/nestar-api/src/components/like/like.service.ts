import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/car/car.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Properties } from '../../libs/dto/car/car';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
     constructor(@InjectModel('Like') private readonly likeModel: Model<Like>,) {}

     public async toggleLike(input: LikeInput): Promise<number> {
        const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
         exist = await this.likeModel.findOne(search).exec();
         let modifier = 1;

         if (exist) {
            await this.likeModel.findOneAndDelete(search).exec();
            modifier = -1;
        } else {
            try {
                await this.likeModel.create(input);
            } catch (err) {
                  console.log('Error, Service.model:', err.message);
                throw new BadRequestException(Message.CREATE_FAILED);
            }
        }
            console.log(` - Like modifier: ${modifier} -`);
        return modifier;
     }

      // like bosilganmi yo'mi shuni aniqlayabti, bosilgan bo'lsa " true " aks holda []
     public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
        const { memberId, likeRefId} = input;
        const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
        return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true}] : [];
     }   

     public async getFavoriteProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
        const { page, limit } = input;
        const match: T = {likeGroup: LikeGroup.CAR, memberId: memberId};

        const data: T = await this.likeModel.aggregate([
            {$match: match},
            {$sort: {updatedAt: -1}},
            {
                $lookup: {
                    from: 'properties',
                    localField: 'likeRefId',
                    foreignField: '_id',
                    as: 'favoriteCar',
                },      // Bu orqali like qilingan car ni olib kelayapsiz.
            },
            { $unwind: '$favoriteCar'},
            {
                $facet: {
                    list: [
                        {$skip: (page-1)*limit},
                        {$limit: limit},
                        lookupFavorite,
                        { $unwind: '$favoriteCar.memberData'},
                    ],             // $ belgisi MongoDB aggregation ichida field referensiyasini bildiradi:
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
        .exec();

        const result: Properties = {list: [], metaCounter: data[0].metaCounter};
        //Ya’ni pipeline natijasini ishlatishga qulay formatga keltirad


        result.list = data[0].list.map((ele) => ele.favoriteCar);
        //Bu kod aggregation natijasidan haqiqiy car obyektlarini ajratib oladi.
        //data[0].list → $facet ichidagi list
        //.map((ele) => ele.favoriteCar) → har bir elementdan favoriteCar ni oladi
        //Endi result.list faqat car obyektlaridan iborat bo‘ladi.




        return result;

     }


}
