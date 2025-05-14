import { UserRole, GetUserListDto } from '../../user';

export class GetDoctorListDto extends GetUserListDto {
  override role = UserRole.DOCTOR;
}
