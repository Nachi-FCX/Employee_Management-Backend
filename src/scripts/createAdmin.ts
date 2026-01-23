import bcrypt from "bcrypt";
import prisma from "../prisma";

/**
 * ===============================
 * CREATE ROOT ADMIN USER
 * ===============================
 * Creates a root user for system administration
 * Run: npm run seed:admin
 */
async function createRootUser() {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const rootUser = await prisma.rootUser.create({
      data: {
        full_name: "System Administrator",
        username: "admin_system",
        email: "admin@system.com",
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    console.log("✅ Root user created successfully");
    console.log(`   Username: ${rootUser.username}`);
    console.log(`   Password: Admin@123`);
    console.log(`   Email: ${rootUser.email}`);
  } catch (error) {
    console.error("❌ Error creating root user:", error);
  }
}

createRootUser()
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
