import { Schema } from 'mongoose';
import { CarFuelType, CarLocation, CarStatus, CarType } from '../libs/enums/car.enum';

const CarSchema = new Schema(
	{
		carType: {
			type: String,
			enum: CarType,
			required: true,
		},

		carStatus: {
			type: String,
			enum: CarStatus,
			default: CarStatus.ACTIVE,
		},

		carLocation: {
			type: String,
			enum: CarLocation,
			required: true,
		},

		carAddress: {
			type: String,
			required: true,
		},

		carTitle: {
			type: String,
			required: true,
		},

		carPrice: {
			type: Number,
			required: true,
		},

		// carSquare: {
		// 	type: Number,
		// 	required: true,
		// },
		carMileage: { // carSquare o'rniga
            type: Number,
            required: true,
            default: 0,
        },

		// carBeds: {
		// 	type: Number,
		// 	required: true,
		// },
		carFuelType: { // carBeds o'rniga (yoqilg'i turi)
            type: String, 
			enum: CarFuelType, // Enum qiymatlari
            required: true,
        },

		// carRooms: {
		// 	type: Number,
		// 	required: true,
		// },
	    carDoors: { // carSeats o'rniga eshiklar soni
        type: Number,
        required: true,
      },

	  
		carViews: {
			type: Number,
			default: 0,
		},

		carLikes: {
			type: Number,
			default: 0,
		},

		carComments: {
			type: Number,
			default: 0,
		},

		carRank: {
			type: Number,
			default: 0,
		},

		carImages: {
			type: [String],
			required: true,
		},

		carDesc: {
			type: String,
		},

		carBarter: {
			type: Boolean,
			default: false,
		},

		carRent: {
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
	{ timestamps: true, collection: 'cars' },
);

CarSchema.index({ carType: 1, carLocation: 1, carTitle: 1, carPrice: 1 }, { unique: true });

export default CarSchema;
