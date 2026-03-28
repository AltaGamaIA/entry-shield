"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getVisitorDocuments() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autenticado" };

    const visitors = await prisma.visitor.findMany({
      where: {
        OR: [
          { idCardUrl: { not: null } },
          { selfieUrl: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        documentId: true,
        documentType: true,
        idCardUrl: true,
        selfieUrl: true,
        visits: {
          select: {
            checkInTime: true,
          },
          take: 1,
          orderBy: { checkInTime: 'desc' }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, visitors };
  } catch (error) {
    console.error("Error fetching visitor documents:", error);
    return { success: false, error: "Error al cargar documentos" };
  }
}
