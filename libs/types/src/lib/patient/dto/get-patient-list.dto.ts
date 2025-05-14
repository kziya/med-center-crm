import { GetUserListDto, UserRole } from '../../user';

export class GetPatientListDto extends GetUserListDto {
  override role = UserRole.PATIENT;
}
