import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { Member } from '../../libs/dto/member/member';
import { MemberModule } from '../member/member.module';
import { CarModule } from '../car/car.module';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { BoardArticleModule } from '../board-article/board-article.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "Comment", 
        schema: CommentSchema
      },
    ]), 
    AuthModule,
    MemberModule,
    CarModule,
    BoardArticleModule,
  ],
  providers: [CommentResolver, CommentService]
})
export class CommentModule {}
