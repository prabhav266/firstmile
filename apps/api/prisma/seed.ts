import { PrismaClient, Role, SkillCategory, Platform, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting database seeding...');

  // 1. Seed Skills
  const defaultSkills = [
    { name: 'Data Structures & Algorithms', category: SkillCategory.DSA },
    { name: 'Frontend Development', category: SkillCategory.DEVELOPMENT },
    { name: 'Backend Development', category: SkillCategory.DEVELOPMENT },
    { name: 'Machine Learning', category: SkillCategory.ML },
    { name: 'System Design', category: SkillCategory.SYSTEM_DESIGN },
    { name: 'Cloud & DevOps', category: SkillCategory.CLOUD },
    { name: 'Database Management', category: SkillCategory.DATABASE },
  ];

  const skillRecords = [];
  for (const skill of defaultSkills) {
    const s = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: { name: skill.name, category: skill.category },
    });
    skillRecords.push(s);
  }
  console.log(`[SEED] Seeded ${skillRecords.length} default skills`);

  // 2. Seed Demo Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pathforge.ai' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@pathforge.ai',
      password: adminPasswordHash,
      role: Role.ADMIN,
      college: 'PathForge Institute',
      branch: 'Computer Science',
      year: 4,
    },
  });
  console.log(`[SEED] Seeded Admin User: ${admin.email}`);

  // 3. Seed Demo Student User
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@college.edu' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'student@college.edu',
      password: studentPasswordHash,
      role: Role.STUDENT,
      college: 'IIT Delhi',
      branch: 'Computer Science',
      year: 3,
      targetCompany: 'Google',
    },
  });
  console.log(`[SEED] Seeded Student User: ${student.email}`);

  // 4. Seed User Skills
  const userSkillLevels = [85, 78, 72, 60, 50, 40, 70];
  for (let i = 0; i < skillRecords.length; i++) {
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: student.id, skillId: skillRecords[i].id } },
      update: { level: userSkillLevels[i] },
      create: {
        userId: student.id,
        skillId: skillRecords[i].id,
        level: userSkillLevels[i],
      },
    });
  }
  console.log('[SEED] Seeded student user skill levels');

  // 5. Seed Coding Logs
  const codingLogsCount = await prisma.codingLog.count({ where: { userId: student.id } });
  if (codingLogsCount === 0) {
    const platforms = [Platform.LEETCODE, Platform.CODEFORCES, Platform.CODECHEF];
    const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];
    const topics = ['Arrays', 'Dynamic Programming', 'Trees', 'Graphs', 'Strings'];
    
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await prisma.codingLog.create({
        data: {
          userId: student.id,
          platform: platforms[i % platforms.length],
          problemsSolved: Math.floor(Math.random() * 4) + 1,
          difficulty: difficulties[i % difficulties.length],
          topic: topics[i % topics.length],
          notes: `Solved standard questions on ${topics[i % topics.length]}.`,
          date,
        },
      });
    }
    console.log('[SEED] Seeded mock coding logs for student');
  }

  // 6. Seed Analytics Entries for Heatmap & Streak
  const analyticsCount = await prisma.analytics.count({ where: { userId: student.id } });
  if (analyticsCount === 0) {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await prisma.analytics.create({
        data: {
          userId: student.id,
          date,
          studyHours: Math.random() * 3 + 1,
          codingHours: Math.random() * 4 + 1,
          mlHours: Math.random() * 2,
          streak: Math.max(1, 15 - i),
          placementScore: 60 + Math.min(25, 30 - i),
        },
      });
    }
    console.log('[SEED] Seeded mock consistency and score analytics');
  }

  console.log('[SEED] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('[SEED] Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
