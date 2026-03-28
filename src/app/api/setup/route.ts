import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { staffId: 'ES-ADMIN-1' },
    });

    if (adminExists) {
      return NextResponse.json({ message: 'La base de datos ya está configurada. Administrador detectado.' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const guardPassword = await bcrypt.hash('password123', 10);

    await prisma.property.create({
      data: {
        name: 'Sede Central (Cloud)',
        address: '123 Cloud Avenue, Vercel',
      },
    });

    await prisma.user.createMany({
      data: [
        {
          name: 'Comandante Supremo',
          email: 'admin@entryshield.com',
          staffId: 'ES-ADMIN-1',
          password: hashedPassword,
          role: 'ADMIN',
        },
        {
          name: 'Guardia Torre 1',
          email: 'guard@entryshield.com',
          staffId: 'ES-GUARD-1',
          password: guardPassword,
          role: 'GUARD',
        },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos en la nube inyectada con credenciales Alpha exitosamente.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
