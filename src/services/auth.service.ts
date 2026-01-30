
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";



const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;


export const validatePassword = async (plain: string, hash: string) => {                // passwaord validation
  const isValid = await bcrypt.compare(plain, hash);
  if (!isValid) {
    throw new Error("INVALID_PASSWORD");
  }
};

export const generateToken = (payload: object,expiresIn: SignOptions["expiresIn"]) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};


export const rootLoginService = async (username: string, password: string, prisma: any) => {            // root user login
  const rootUser = await prisma.rootUser.findUnique({
    where: { username },
  });

  if (!rootUser || !rootUser.is_active) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await validatePassword(password, rootUser.password_hash);

  const token = generateToken({root_user_id: rootUser.id,type: "ROOT",},"2h");

  return { rootUser, token };
};


export const employeeLoginService = async (username: string, password: string, prisma: any) => {      // employee user login
  const userAccount = await prisma.users.findFirst({
    where: { username },
    include: {
      employee: true,
      role: true,
      company: true,
    },
  });

  if (!userAccount || !userAccount.is_active) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await validatePassword(password, userAccount.password_hash);

  const token = generateToken(
    {
      user_id: userAccount.id,
      employee_id: userAccount.employee_id,
      company_id: userAccount.company_id,
      role: userAccount.role.role_name,
      type: "EMPLOYEE",
    },
    "8h"
  );

  return { userAccount, token };
};
