import { Profile } from '../../entities/Profile';
import { AppDataSource } from '../../data-source';
import { profileService } from '../profileService';

jest.mock('../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

const createRepositoryMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  find: jest.fn()
});

describe('profileService', () => {
  let mockProfileRepository: ReturnType<typeof createRepositoryMock>;

  beforeEach(() => {
    mockProfileRepository = createRepositoryMock();
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockProfileRepository);
    jest.clearAllMocks();
  });

  const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
    id: 'profile-id',
    name: 'John Doe',
    age: '30',
    gender: 'Male',
    maritalStatus: 'Single',
    caste: 'General',
    education: 'University',
    occupation: 'Engineer',
    location: 'City',
    contact: '1234567890',
    email: 'john@example.com',
    role: 'User',
    phoneNumber: '1234567890',
    website: 'https://example.com',
    socialLinks: '@john',
    skills: 'JS',
    isPublic: true,
    isUserProfile: false,
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {} as any,
    ...overrides
  });

  it('creates a profile using the repository', async () => {
    const input = { name: 'Jane' } as Partial<Profile>;
    const created = createMockProfile({ name: 'Jane' });
    mockProfileRepository.create.mockReturnValue(created);
    mockProfileRepository.save.mockResolvedValue(created);

    const result = await profileService.createProfile(input);

    expect(mockProfileRepository.create).toHaveBeenCalledWith(input);
    expect(mockProfileRepository.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('returns an existing profile when found', async () => {
    const existing = createMockProfile();
    mockProfileRepository.findOne.mockResolvedValue(existing);

    const result = await profileService.getProfile(existing.id);

    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ where: { id: existing.id } });
    expect(result).toBe(existing);
  });

  it('throws an error when profile does not exist', async () => {
    mockProfileRepository.findOne.mockResolvedValue(null);

    await expect(profileService.getProfile('missing-id')).rejects.toThrow('Profile not found');
  });

  it('updates a profile and persists changes', async () => {
    const existing = createMockProfile();
    const updates = { location: 'New City', occupation: 'Manager' };
    const updated = { ...existing, ...updates };

    mockProfileRepository.findOne.mockResolvedValue(existing);
    mockProfileRepository.save.mockResolvedValue(updated);

    const result = await profileService.updateProfile(existing.id, updates);

    expect(existing.location).toBe('New City');
    expect(existing.occupation).toBe('Manager');
    expect(mockProfileRepository.save).toHaveBeenCalledWith(existing);
    expect(result).toEqual(updated);
  });

  it('deletes a profile after ensuring it exists', async () => {
    const existing = createMockProfile();
    mockProfileRepository.findOne.mockResolvedValue(existing);
    mockProfileRepository.remove.mockResolvedValue(undefined);

    await profileService.deleteProfile(existing.id);

    expect(mockProfileRepository.remove).toHaveBeenCalledWith(existing);
  });
});

