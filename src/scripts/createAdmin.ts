import bcrypt from "bcrypt";
import prisma from "../prisma";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.users.create({
    data: {
      employee_id: 1, 
      username: "admin",
      password_hash: hashedPassword,
      role_id: 1, 
      is_active: true,
    },
  });

  console.log("✅ Admin user created successfully");
}

createAdmin()
  .catch((err) => console.error(err))
  .finally(() => process.exit());
