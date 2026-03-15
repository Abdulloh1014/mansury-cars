import { Field, InputType, Int } from "@nestjs/graphql";
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator'
import { MemberAuthType, MemberStatus, MemberType } from "../../enums/member.enum";
import { availableAgentStors, availableMembersStors } from "../../config";
import { Direction } from "../../enums/common.enum";



@InputType()
export class MemberInput {
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick: string;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;
                           //@Field — car’ni GraphQL maydoniga aylantiradi.
    @IsNotEmpty()
    @Field(() => String)
    memberPhone: string;
    
    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;

    @IsOptional()
    @Field(() => MemberAuthType, { nullable: true})
    memberAuthType?: MemberAuthType;
}


@InputType()
export class LoginInput {
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick: string;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword: string;
}

@InputType()
class AISearch {
    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;
}

@InputType()
export class AgentsInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;    

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableAgentStors)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
       // shu jjoyi ortiqcha bo'lishi xam mumkun
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => AISearch)
    search: AISearch;

}



@InputType()
class MISearch {

    @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;


    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;
}

@InputType()
export class MembersInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn(availableMembersStors)   // @IsIn bu propertida ichida berilgan qiymatlarni qabul qiladi
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => MISearch)
    search: MISearch;
}


@InputType()
export class GoogleLoginInput {
    @IsNotEmpty()
    @Field(() => String)
    memberEmail: string;

    @IsNotEmpty()
    @Field(() => String)
    memberNick: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberImage?: string;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;
}




   

