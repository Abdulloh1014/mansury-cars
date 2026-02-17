import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @AuthMember — NestJS uchun custom param decorator.
 * Maqsad: HTTP yoki GraphQL requestdan autentifikatsiya qilingan userni (member) oson olish.
 * 
 * HTTP requestda: req.body.authMember dan oladi (odatda JWT middleware orqali qo'yilgan).
 * GraphQL resolverda: GQL contextdan req ni olib, xuddi shu body.authMember dan foydalanadi.
 * 
 * Foydalanish:
 * @AuthMember() member: MemberDto
 * @AuthMember('_id') memberId: ObjectId
 */
export const AuthMember = createParamDecorator(
  (data: string, context: ExecutionContext | any) => {
    let request: any;

    // GraphQL resolverda ishlayotgan bo'lsa
    if (context.contextType === 'graphql') {
      // GraphQL contextdan 3-argument (index 2) — bu req obyektini oladi
      request = context.getArgByIndex(2).req;

      // Agar authMember allaqachon bodyda bo'lsa, authorization headerni qo'shib qo'yamiz
      // (JWT guard yoki middleware headerni o'qishi uchun kerak bo'lishi mumkin)
      if (request.body.authMember) {
        request.body.authMember.authorization = request.headers?.authorization;
      }
    } else {
      // Oddiy HTTP controllerda bo'lsa — standart requestni oladi
      request = context.switchToHttp().getRequest();
    }

    // console.log("requsest:", request); // Debug uchun (keyin o'chirish mumkin)

    // Asosiy ma'lumot: request.body.authMember — oldin middleware yoki guard tomonidan qo'yilgan member obyekt
    const member = request.body.authMember;

    // Agar data parametri berilgan bo'lsa (masalan, '_id'), faqat o'sha maydonni qaytaradi
    // Aks holda butun member obyektini qaytaradi
    if (member) return data ? member?.[data] : member;

    // Agar member topilmasa (login qilinmagan bo'lsa) — null qaytaradi
    else return null;
  }
);












// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const AuthMember = createParamDecorator((data: string, context: ExecutionContext | any) => {
// 	let request: any;
// 	if (context.contextType === 'graphql') {
// 		request = context.getArgByIndex(2).req;
// 		if (request.body.authMember) {
// 			request.body.authMember.authorization = request.headers?.authorization;
// 		}
// 	} else request = context.switchToHttp().getRequest();
// 	// console.log("requsest:", request)

// 	const member = request.body.authMember;

// 	if (member) return data ? member?.[data] : member;
// 	else return null;
// });
