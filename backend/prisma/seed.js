import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const superAdminRole = await prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: {},
        create: { name: 'SUPER_ADMIN', description: 'System administrator' },
    });
    const hrAdminRole = await prisma.role.upsert({
        where: { name: 'HR_ADMIN' },
        update: {},
        create: { name: 'HR_ADMIN', description: 'Human resources administrator' },
    });
    const managerRole = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {},
        create: { name: 'MANAGER', description: 'Department manager' },
    });
    const employeeRole = await prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {},
        create: { name: 'EMPLOYEE', description: 'Regular employee' },
    });
    const permissions = [
        'employee:read:self',
        'employee:crud',
        'leave:approve:team',
        'attendance:read:team',
        'payroll:manage',
        'recruitment:manage',
        'training:manage',
        'department:manage',
        'system:manage',
        'audit:read',
    ];
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { name: permission },
            update: {},
            create: { name: permission, description: permission },
        });
    }
    const departments = ['Engineering', 'Human Resources', 'Finance', 'Sales'];
    for (const name of departments) {
        await prisma.department.upsert({
            where: { name },
            update: {},
            create: { name, description: name },
        });
    }
    const designations = ['Senior Engineer', 'HR Specialist', 'Finance Analyst', 'Sales Executive'];
    for (const name of designations) {
        await prisma.designation.upsert({
            where: { name },
            update: {},
            create: { name, level: 1, description: name },
        });
    }
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@valerion.local' },
        update: {},
        create: {
            email: 'superadmin@valerion.local',
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            status: 'ACTIVE',
            isVerified: true,
            roleId: superAdminRole.id,
        },
    });
    await prisma.user.upsert({
        where: { email: 'hradmin@valerion.local' },
        update: {},
        create: {
            email: 'hradmin@valerion.local',
            passwordHash,
            firstName: 'HR',
            lastName: 'Admin',
            status: 'ACTIVE',
            isVerified: true,
            roleId: hrAdminRole.id,
        },
    });
    await prisma.user.upsert({
        where: { email: 'manager@valerion.local' },
        update: {},
        create: {
            email: 'manager@valerion.local',
            passwordHash,
            firstName: 'Manager',
            lastName: 'User',
            status: 'ACTIVE',
            isVerified: true,
            roleId: managerRole.id,
            managerId: superAdmin.id,
        },
    });
    await prisma.user.upsert({
        where: { email: 'employee@valerion.local' },
        update: {},
        create: {
            email: 'employee@valerion.local',
            passwordHash,
            firstName: 'Employee',
            lastName: 'User',
            status: 'ACTIVE',
            isVerified: true,
            roleId: employeeRole.id,
        },
    });
}
main()
    .then(() => console.log('Seed completed'))
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
