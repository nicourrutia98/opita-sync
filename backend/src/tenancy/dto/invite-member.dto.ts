import { IsEmail, IsIn } from 'class-validator';
import { roleCodes } from '../../common/types/permission.constants';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(roleCodes)
  roleCode!: (typeof roleCodes)[number];
}
