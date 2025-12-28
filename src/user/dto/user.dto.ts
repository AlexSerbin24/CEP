export class UserResponseDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  createdAt: Date;
  roleId: number;
  roleName: string;
  avatarLink?:string;
  password?: string
}
