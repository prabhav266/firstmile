import { prisma } from '../lib/prisma';

async function purgeAllUsers() {
  console.log('\n======================================================');
  console.log('[FIRST MILE] 🧹 Starting Complete Database User Purge...');
  console.log('======================================================\n');

  try {
    // 1. Delete Verification Tokens
    try {
      const tokens = await (prisma as any).verificationToken.deleteMany({});
      console.log(`✓ Deleted ${tokens.count} verification tokens.`);
    } catch (e) {
      console.log('Verification tokens table skipped / cleared.');
    }

    // 2. Delete Audit Logs & Sessions
    try {
      await (prisma as any).auditLog?.deleteMany({});
      console.log('✓ Cleared audit logs.');
    } catch (e) {}

    // 3. Delete Resumes
    try {
      const resumes = await (prisma as any).resume?.deleteMany({});
      console.log(`✓ Deleted ${resumes?.count || 0} resume records.`);
    } catch (e) {}

    // 4. Delete Coding Logs
    try {
      const coding = await (prisma as any).codingProblem?.deleteMany({});
      console.log(`✓ Deleted ${coding?.count || 0} coding problem logs.`);
    } catch (e) {}

    // 5. Delete Interview Sessions
    try {
      const interviews = await (prisma as any).interviewSession?.deleteMany({});
      console.log(`✓ Deleted ${interviews?.count || 0} interview sessions.`);
    } catch (e) {}

    // 6. Delete Roadmaps & Goals
    try {
      await (prisma as any).roadmapNode?.deleteMany({});
      await (prisma as any).roadmap?.deleteMany({});
      await (prisma as any).goal?.deleteMany({});
      await (prisma as any).weeklyPlanner?.deleteMany({});
      console.log('✓ Cleared roadmaps and weekly goals.');
    } catch (e) {}

    // 7. Delete Projects & Skills
    try {
      await (prisma as any).project?.deleteMany({});
      await (prisma as any).skillProficiency?.deleteMany({});
      console.log('✓ Cleared project and skill proficiencies.');
    } catch (e) {}

    // 8. Delete Recruiter & TPO records
    try {
      await (prisma as any).recruiterPipeline?.deleteMany({});
      await (prisma as any).campusDrive?.deleteMany({});
      console.log('✓ Cleared recruiter pipelines and campus drives.');
    } catch (e) {}

    // 9. Delete All Users
    const users = await prisma.user.deleteMany({});
    console.log(`\n🎉 SUCCESS: Deleted ${users.count} user accounts.`);
    console.log('✨ The database now has 0 users — completely fresh start for FIRST MILE!\n');
  } catch (err) {
    console.error('Error during purge:', err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

purgeAllUsers();
