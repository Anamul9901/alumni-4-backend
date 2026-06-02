import { User } from '../modules/User/user.model';

export const seedDatabase = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@appointx.com' });
    if (!adminExists) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@appointx.com',
        password: 'Admin@123',
        role: 'admin',
        isDeleted: false,
      });
      console.log('Seeded admin@appointx.com');
    }

    const managerExists = await User.findOne({ email: 'manager@appointx.com' });
    if (!managerExists) {
      await User.create({
        name: 'Demo Manager',
        email: 'manager@appointx.com',
        password: 'Manager@123',
        role: 'project_manager',
        isDeleted: false,
      });
      console.log('Seeded manager@appointx.com');
    }

    const memberExists = await User.findOne({ email: 'member@appointx.com' });
    if (!memberExists) {
      await User.create({
        name: 'Demo Member',
        email: 'member@appointx.com',
        password: 'Member@123',
        role: 'team_member',
        isDeleted: false,
      });
      console.log('Seeded member@appointx.com');
    }

    // Seed direct login demo user from old login page
    const directLoginExists = await User.findOne({ email: 'anamul@gmail.com' });
    if (!directLoginExists) {
      await User.create({
        name: 'Anamul Haque',
        email: 'anamul@gmail.com',
        password: 'Anamul@018',
        role: 'admin',
        isDeleted: false,
      });
      console.log('Seeded anamul@gmail.com (Direct Login Admin)');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};
