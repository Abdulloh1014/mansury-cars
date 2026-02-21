import { registerEnumType } from '@nestjs/graphql';

export enum CarType {
    SEDAN = 'SEDAN',
    SUV = 'SUV',
    HATCHBACK = 'HATCHBACK',
    COUPE = 'COUPE',
    ELECTRIC = 'ELECTRIC',
    PICKUP = 'PICKUP',
}
registerEnumType(CarType, {    //registerEnumType() TypeScript enum’ni GraphQL tushunishi uchun  majbur.
	name: 'CarType',
});

export enum CarColor {
	BLACK = 'BLACK',
	WHITE = 'WHITE',
	GRAY = 'GRAY',
	RED = 'RED',
	BLUE = 'BLUE',
	SILVER = 'SILVER',
	GREEN = 'GREEN',
	YELLOW = 'YELLOW',
	BROWN = 'BROWN',
}
registerEnumType(CarColor, {
	name: 'CarColor',
});

export enum CarFuelType {
	GASOLINE = 'GASOLINE',
	DIESEL = 'DIESEL',
	ELECTRIC = 'ELECTRIC',
	HYBRID = 'HYBRID',
}
registerEnumType(CarFuelType, {
	name: 'CarFuelType',
});


export enum CarStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(CarStatus, {
	name: 'CarStatus',
});


export enum CarLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(CarLocation, {
	name: 'CarLocation',
});
