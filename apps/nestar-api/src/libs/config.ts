import { ObjectId } from 'bson';



export const availableAgentStors = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']
export const availableMembersStors = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews']
export const availableOptions = ['carBarter', 'carRent'];
export const availableCarSorts = [
   'createdAt',
  'updatedAt',
  'carLikes',
  'carViews',
  'carRank',
  'carPrice',
];
export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

  
 // IMAGE CONFIGURATION
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};


export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: "likes",
			let: {
				localLikeRefId: targetRefId,
                localMemberId: memberId,
				localMyFavorite: true
			},
			pipeline: [
				{
					$match: {
						$expr: {       // eq: tenglik operatori. U qiymat tengligini tekshiradi.
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId']}, { $eq: ['$memberId', '$$localMemberId'] }],
						},   // $and bilan ikkita shart birga ishlaydi
					},
				},
				{  // $project =>> Hujjatdan kerakli maydonlarni tanlash
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',  // shu nom blan saqlash
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}
export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
 	return {
		$lookup: {
			from: "follows",
			let: {
				localFollowerId: followerId,
                localFollowingId: followingId,
				localMyFavorite: true
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerId', '$$localFollowerId']}, { $eq: ['$followingId', '$$localFollowingId'] }],
						},
					},
				},
				{   // $project → qaysi data kelsin, qaysi biri kelmasin ni belgilaydi.
					$project: {
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFollowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};




export const lookupMember = {
	$lookup: {
		from: 'members',           // 2)  db dagi members collectiondan 
		localField: 'memberId',    // 1)  kelgan memberId ni
		foreignField: '_id',       // 3)  _id bo'limidan topib
		as: 'memberData',          // 4)  memberData nomi bilan qaytaradi
	},
};


export const lookupFollowingData = {
	$lookup: {
		from: 'members',		   
		localField: 'followingId',	
		foreignField: '_id',       
		as: 'followingData',          
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',           
		localField: 'followerId',	
		foreignField: '_id',       
		as: 'followerData',          
	},
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',           
		localField: 'favoriteCar.memberId',	
		foreignField: '_id',       
		as: 'favoriteCar.memberData',          
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',           
		localField: 'visitedCar.memberId',	// car egasini Id si
		foreignField: '_id',       
		as: 'visitedCar.memberData',          
	},
};



