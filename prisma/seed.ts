import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connection: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })


async function main() {
  console.log(process.env.ROLE_ADMIN)
  const adminRoleName = process.env.ROLE_ADMIN || 'admin'
  const adminRole = await prisma.role.upsert({
    where: { name: adminRoleName },
    update: {},
    create: {
      name: adminRoleName,
    },
  });


  const userRoleName = process.env.ROLE_USER || 'user'
  const userRole = await prisma.role.upsert({
    where: { name: userRoleName },
    update: {},
    create: {
      name: userRoleName,
    },
  });

  console.log('Roles seeded:', { adminRole, userRole });
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })