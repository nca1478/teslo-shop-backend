import { IsString, IsIn } from 'class-validator';
import { Role } from '../../../domain/enums/role.enum';

export class ChangeUserRoleDto {
  @IsString()
  @IsIn(Object.values(Role))
  role: Role;
}
