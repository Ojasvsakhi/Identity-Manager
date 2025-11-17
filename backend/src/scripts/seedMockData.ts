import 'reflect-metadata';
import { AppDataSource, initializeDatabase } from '../data-source';
import { User } from '../entities/User';
import { Profile } from '../entities/Profile';

type MockUser = Pick<User, 'username' | 'email' | 'name' | 'role'> & {
  password: string;
};

type MockProfile = Omit<
  Profile,
  'id' | 'createdAt' | 'updatedAt' | 'user' | 'userId'
> & {
  ownerEmail: string;
};

const mockUsers: MockUser[] = [
  {
    username: 'demo_admin',
    email: 'admin@example.com',
    name: 'Demo Admin',
    role: 'admin',
    password: 'AdminPass123!'
  },
  {
    username: 'demo_recruiter',
    email: 'recruiter@example.com',
    name: 'Recruiter One',
    role: 'user',
    password: 'Recruiter123!'
  },
  {
    username: 'demo_matchmaker',
    email: 'matchmaker@example.com',
    name: 'Match Maker',
    role: 'user',
    password: 'MatchMaker123!'
  }
];

const mockProfiles: MockProfile[] = [
  {
    ownerEmail: 'admin@example.com',
    name: 'Priya Sharma',
    age: '27',
    gender: 'Female',
    maritalStatus: 'Single',
    caste: 'General',
    education: 'IIM Bangalore, MBA',
    occupation: 'Product Manager',
    location: 'Bengaluru, India',
    contact: 'priya@sharmafamily.in',
    email: 'priya.sharma@example.com',
    role: 'user',
    bio: 'Product manager focused on FinTech with a love for art and travel.',
    phoneNumber: '+91 90000 10001',
    website: 'https://priyasharma.example.com',
    socialLinks: '@priyasharma',
    skills: 'Leadership, Product Strategy, UX Research',
    experience: '5 years in FinTech product roles',
    isPublic: true,
    isUserProfile: false,
    notes: 'Prefers partners who enjoy hiking and photography.'
  },
  {
    ownerEmail: 'recruiter@example.com',
    name: 'Arjun Menon',
    age: '30',
    gender: 'Male',
    maritalStatus: 'Single',
    caste: 'OBC',
    education: 'BITS Pilani, B.E. Computer Science',
    occupation: 'Senior Software Engineer',
    location: 'Hyderabad, India',
    contact: 'arjun@menonfamily.in',
    email: 'arjun.menon@example.com',
    role: 'user',
    bio: 'Full-stack engineer passionate about open-source and cycling.',
    phoneNumber: '+91 90000 10002',
    website: 'https://arjunmenon.dev',
    socialLinks: '@codewitharjun',
    skills: 'Node.js, React, Distributed Systems',
    experience: '7 years building large-scale SaaS products',
    isPublic: true,
    isUserProfile: true,
    notes: 'Volunteers with local STEM programs during weekends.'
  },
  {
    ownerEmail: 'matchmaker@example.com',
    name: 'Sneha Patel',
    age: '26',
    gender: 'Female',
    maritalStatus: 'Single',
    caste: 'General',
    education: 'Delhi University, B.A. Economics',
    occupation: 'HR Consultant',
    location: 'Ahmedabad, India',
    contact: 'sneha@patelconnect.com',
    email: 'sneha.patel@example.com',
    role: 'user',
    bio: 'HR consultant who enjoys classical dance and community theatre.',
    phoneNumber: '+91 90000 10003',
    website: 'https://snehapatel.me',
    socialLinks: '@snehaMoves',
    skills: 'People Ops, Talent Strategy, Communication',
    experience: '4 years in HR consulting firms',
    isPublic: false,
    isUserProfile: false,
    notes: 'Looking for someone open to relocating abroad in the next 2 years.'
  },
  {
    ownerEmail: 'recruiter@example.com',
    name: 'Rahul Verma',
    age: '29',
    gender: 'Male',
    maritalStatus: 'Single',
    caste: 'SC',
    education: 'IIT Delhi, M.Tech Mechanical Engineering',
    occupation: 'Research Scientist',
    location: 'Pune, India',
    contact: 'rahul@vermainnovations.com',
    email: 'rahul.verma@example.com',
    role: 'user',
    bio: 'Researcher working on sustainable energy solutions; avid trekker.',
    phoneNumber: '+91 90000 10004',
    website: 'https://rahulresearch.com',
    socialLinks: '@rahulResearch',
    skills: 'R&D, Data Analysis, Technical Writing',
    experience: '6 years in renewable energy R&D',
    isPublic: true,
    isUserProfile: false,
    notes: 'Completed multiple Himalayan treks; seeking a partner who enjoys outdoors.'
  },
  {
    ownerEmail: 'matchmaker@example.com',
    name: 'Neha Kulkarni',
    age: '31',
    gender: 'Female',
    maritalStatus: 'Divorced',
    caste: 'ST',
    education: 'Symbiosis University, M.A. Psychology',
    occupation: 'Therapist',
    location: 'Mumbai, India',
    contact: 'neha@mindfulmatters.in',
    email: 'neha.kulkarni@example.com',
    role: 'user',
    bio: 'Therapist focused on mindfulness; enjoys marine drives and poetry.',
    phoneNumber: '+91 90000 10005',
    website: 'https://mindfulmatters.in',
    socialLinks: '@mindfulneha',
    skills: 'Counseling, Mindfulness, Workshops',
    experience: '8 years in counseling psychology',
    isPublic: false,
    isUserProfile: true,
    notes: 'Open to meeting someone with kids; values empathy and curiosity.'
  }
];

async function seed() {
  await initializeDatabase();

  const userRepository = AppDataSource.getRepository(User);
  const profileRepository = AppDataSource.getRepository(Profile);

  const persistedUsers: Record<string, User> = {};

  for (const mockUser of mockUsers) {
    let user = await userRepository.findOne({ where: { email: mockUser.email } });

    if (!user) {
      user = userRepository.create(mockUser);
      user = await userRepository.save(user);
      console.log(`Created user ${mockUser.email}`);
    } else {
      console.log(`User ${mockUser.email} already exists, skipping creation`);
    }

    persistedUsers[mockUser.email] = user;
  }

  for (const mockProfile of mockProfiles) {
    const owner = persistedUsers[mockProfile.ownerEmail];

    if (!owner) {
      console.warn(`Skipping profile ${mockProfile.name}; owner ${mockProfile.ownerEmail} not found.`);
      continue;
    }

    const existingProfile = await profileRepository.findOne({
      where: { email: mockProfile.email }
    });

    if (existingProfile) {
      console.log(`Profile ${mockProfile.email} already exists, skipping creation`);
      continue;
    }

    const profileEntity = profileRepository.create({
      ...mockProfile,
      user: owner,
      userId: owner.id
    });

    await profileRepository.save(profileEntity);
    console.log(`Created profile for ${mockProfile.name}`);
  }

  await AppDataSource.destroy();
  console.log('Mock data seeding completed.');
}

seed().catch((error) => {
  console.error('Error while seeding mock data:', error);
  AppDataSource.destroy();
  process.exit(1);
});

