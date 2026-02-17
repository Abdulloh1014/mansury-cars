import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {

		//Guard qaysi rollarga ruxsat berilganini shu joyda bilib oladi.
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;   // contextni 2-indexda req bo'ladi
			const bearerToken = request.headers.authorization;
			
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

			const token = bearerToken.split(' ')[1],
			
				authMember = await this.authService.verifyToken(token),

				
                // roles array ichida authMember.memberType mavjudmi yoki yo‘qmi tekshiradi.
                // Agar topsa (index > -1 bo‘lsa) true, topmasa false qaytaradi.

				// hasRole() — rolni tekshiradi,              (index > -1 bo‘lsa)
				hasRole = () => roles.indexOf(authMember.memberType) > -1,

                // Boshlang‘ich qiymati sifatida hasRole() funksiyasini chaqiradi.
                // Ya’ni foydalanuvchining roli mos kelsa true, aks holda false bo‘ladi.

				//hasPermission — shu tekshiruv natijasini saqlaydi.
				hasPermission: boolean = hasRole();
            
			if (!authMember || !hasPermission) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

			console.log('memberNick[roles] =>', authMember.memberNick);
			request.body.authMember = authMember;
			return true;
		}

		// description => http, rpc, gprs and etc are ignored
	}
}
