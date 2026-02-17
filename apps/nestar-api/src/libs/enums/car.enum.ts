import { registerEnumType } from '@nestjs/graphql';

export enum CarType {
	APARTMENT = 'APARTMENT',
	VILLA = 'VILLA',
	HOUSE = 'HOUSE',
}
registerEnumType(CarType, {    //registerEnumType() TypeScript enum’ni GraphQL tushunishi uchun  majbur.
	name: 'CarType',
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
