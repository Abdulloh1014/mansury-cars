import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;   // qaysi member like bosyabti

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId;   // qaysi targetga like bosdi

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup;    // qaysi turdagi like ni amalga oshirdi
}
