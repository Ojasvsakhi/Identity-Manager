import { Profile } from '../entities/Profile';
import { AppDataSource } from '../data-source';
import { Like } from 'typeorm';

const getProfileRepository = () => AppDataSource.getRepository(Profile);

export const profileService = {
  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    const profileRepository = getProfileRepository();
    const profile = profileRepository.create(profileData);
    return await profileRepository.save(profile);
  },

  async getProfile(id: string): Promise<Profile> {
    const profileRepository = getProfileRepository();
    const profile = await profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile;
  },

  async updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
    const profile = await this.getProfile(id);
    const profileRepository = getProfileRepository();
    Object.assign(profile, profileData);
    return await profileRepository.save(profile);
  },

  async deleteProfile(id: string): Promise<void> {
    const profile = await this.getProfile(id);
    const profileRepository = getProfileRepository();
    await profileRepository.remove(profile);
  },

  async getAllProfiles(): Promise<Profile[]> {
    const profileRepository = getProfileRepository();
    return await profileRepository.find();
  },

  async searchProfiles(query: {
    name?: string;
    age?: string;
    gender?: string;
    maritalStatus?: string;
    educationType?: string;
  }): Promise<Profile[]> {
    const where: any = {};

    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.age) {
      where.age = query.age;
    }
    if (query.gender) {
      where.gender = query.gender;
    }
    if (query.maritalStatus) {
      where.maritalStatus = query.maritalStatus;
    }
    if (query.educationType) {
      if (query.educationType === 'public') {
        where.education = Like('%University%');
      } else if (query.educationType === 'private') {
        where.education = Like('%Private%');
      }
    }

    const profileRepository = getProfileRepository();
    return await profileRepository.find({ where });
  }
};