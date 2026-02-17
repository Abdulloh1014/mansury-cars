import { Schema } from 'mongoose';
import { CarLocation, CarStatus, CarType } from '../libs/enums/car.enum';

const CarSchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: CarType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: CarStatus,
			default: CarStatus.ACTIVE,
		},

		propertyLocation: {
			type: String,
			enum: CarLocation,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertySquare: {
			type: Number,
			required: true,
		},

		propertyBeds: {
			type: Number,
			required: true,
		},

		propertyRooms: {
			type: Number,
			required: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
		},

		propertyBarter: {
			type: Boolean,
			default: false,
		},

		propertyRent: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'properties' },
);

CarSchema.index({ propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 }, { unique: true });

export default CarSchema;
