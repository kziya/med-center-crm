import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommonUserService, UserNotFoundException } from '@med-center-crm/user';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateDoctorDto,
  DoctorDetails,
  DoctorFullDto,
  GetUserListDto,
  UpdateDoctorDetailsDto,
  UpdateUserContactDto,
  UpdateUserGeneralDto,
  UserContacts,
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
    private readonly userRepository: Repository<Users>,
    @InjectRepository(DoctorDetails)
    private readonly doctorDetailsRepository: Repository<DoctorDetails>
  ) {}

  async getDoctorList(getUserListDto: GetUserListDto): Promise<Users[]> {
    return this.commonUserService.getUserList(UserRole.DOCTOR, getUserListDto);
  }

  async getDoctorById(
    payload: UserTokenPayload,
    id: number
  ): Promise<DoctorFullDto> {
    this.validateAccess(payload, id);

    const raw = await this.userRepository
      .createQueryBuilder('u')
      .leftJoin(UserContacts, 'contact', 'contact.user_id = u.user_id')
      .leftJoin(DoctorDetails, 'details', 'details.user_id = u.user_id')
      .where('u.user_id = :id', { id })
      .andWhere('u.role = :role', { role: UserRole.DOCTOR })
      .select([
        'u.user_id AS user_id',
        'u.gender AS gender',
        'u.email AS email',
        'u.full_name AS full_name',
        'u.role AS role',
        'u.status AS status',
        'contact.phone AS contact_phone',
        'contact.address AS contact_address',
        'contact.details AS contact_details',
        'details.specialty AS details_specialty',
        'details.license_number AS details_license_number',
        'details.education AS details_education',
        'details.career_summary AS details_career_summary',
        'details.availability AS details_availability',
      ])
      .getRawOne();

    if (!raw) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      user_id: raw.user_id,
      gender: raw.gender,
      email: raw.email,
      full_name: raw.full_name,
      role: raw.role,
      status: raw.status,
      contact: {
        phone: raw.contact_phone,
        address: raw.contact_address,
        details: raw.contact_details,
      },
      details: {
        specialty: raw.details_specialty,
        license_number: raw.details_license_number,
        education: raw.details_education,
        career_summary: raw.details_career_summary,
        availability: raw.details_availability,
      },
    };
  }

  async createDoctor(createUserDto: CreateDoctorDto): Promise<Users> {
    return this.userRepository.manager.transaction(
      async (transactionManager) => {
        const user = await this.commonUserService.createUser(
          transactionManager,
          UserRole.DOCTOR,
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

  async updateDoctorDetails(
    userTokenPayload: UserTokenPayload,
    id: number,
    updateDoctorDetailsDto: UpdateDoctorDetailsDto
  ): Promise<void> {
    this.validateAccess(userTokenPayload, id);
    const result = await this.doctorDetailsRepository.update(
      { user_id: id },
      updateDoctorDetailsDto
    );

    if (result.affected === 0) {
      throw new UserNotFoundException();
    }

    return;
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
