import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommonUserService } from '@med-center-crm/user';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateDoctorDto,
  DoctorDetails,
  DoctorFullDto,
  GetUserListDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserRole,
  Users,
} from '@med-center-crm/types';
import { Repository } from 'typeorm';
import { UserTokenPayload } from '@med-center-crm/auth';

@Injectable()
export class DoctorService {
  constructor(
    private readonly commonUserService: CommonUserService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  async getDoctorList(getUserListDto: GetUserListDto): Promise<Users[]> {
    return this.commonUserService.getUserList(UserRole.DOCTOR, getUserListDto);
  }

  async getDoctorById(
    payload: UserTokenPayload,
    id: number
  ): Promise<DoctorFullDto> {
    this.validateAccess(payload, id);

    const doctor = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.contact', 'contact')
      .leftJoin('doctor_details', 'details', 'details.user_id = u.user_id')
      .addSelect([
        'details.specialty',
        'details.license_number',
        'details.education',
        'details.career_summary',
        'details.availability',
      ])
      .where('u.user_id = :id', { id })
      .andWhere('u.role = :role', { role: UserRole.DOCTOR })
      .getOne();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      ...doctor,
      details: {
        specialty: (doctor as any).details_specialty,
        license_number: (doctor as any).details_license_number,
        education: (doctor as any).details_education,
        career_summary: (doctor as any).details_career_summary,
        availability: (doctor as any).details_availability,
      },
    };
  }

  async createDoctor(createUserDto: CreateDoctorDto): Promise<Users> {
    return this.userRepository.manager.transaction(
      async (transactionManager) => {
        const user = await this.commonUserService.createUser(
          transactionManager,
          createUserDto
        );

        await transactionManager.save(DoctorDetails, {
          user_id: user.user_id,
          ...createUserDto.details,
        });

        return user;
      }
    );
  }

  async updateDoctorGeneral(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserGeneral: UpdateUserGeneralDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.updateUserGeneral(
        transactionManager,
        id,
        updateUserGeneral
      )
    );
  }

  async updateDoctorContact(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateUserContact: UpdateUserContactDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);

    return this.userRepository.manager.transaction((transactionManager) =>
      this.commonUserService.updateUserContact(
        transactionManager,
        id,
        updateUserContact
      )
    );
  }

  private validateAccess(userTokenPayload: UserTokenPayload, id: number): void {
    if (
      userTokenPayload.role === UserRole.DOCTOR &&
      userTokenPayload.id !== id
    ) {
      throw new ForbiddenException();
    }
  }
}
