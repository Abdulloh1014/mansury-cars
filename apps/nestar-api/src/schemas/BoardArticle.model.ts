import { Schema } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../libs/enums/board-article.enum';
import { MemberType } from '../libs/enums/member.enum';

const BoardArticleSchema = new Schema(
	{

		// memberType: {
		// 	type: String,
		// 	enum: Object.values(MemberType),
		// 	required: true,
		// },


		articleCategory: {
			type: String,
			enum: BoardArticleCategory,
			required: true,
		},

		articleStatus: {
			type: String,
			enum: BoardArticleStatus,
			default: BoardArticleStatus.ACTIVE,
		},

		articleTitle: {
			type: String,
			required: true,
		},

		articleContent: {
			type: String,
			required: true,
		},

		articleImage: {
			type: String,
		},

		articleLikes: {
			type: Number,
			default: 0,
		},

		articleViews: {
			type: Number,
			default: 0,
		},

		articleComments: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'boardArticles' },
);

export default BoardArticleSchema;
