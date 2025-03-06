import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function mockData() {
  await prisma.user.create({
    data: { id: "xdumPg9v0Wws6db8D8gtdGU6gePh", country: "Japan" },
  });
  await prisma.group.create({ data: { name: "Test Group", id: 1 } });
  await prisma.groupUserRole.create({
    data: { userId: "xdumPg9v0Wws6db8D8gtdGU6gePh", groupId: 1, role: "admin" },
  });
}
mockData();
