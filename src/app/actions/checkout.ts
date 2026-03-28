"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function checkoutVisitor(visitId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "No autorizado." };
    }

    if (!visitId) {
      return { success: false, error: "ID de visita es obligatorio." };
    }

    // 1. Update the Visit Record with the current time
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        checkOutTime: new Date(),
      },
    });

    // We might also want to set the Visitor status back to "CHECKED_OUT" or "PENDING"
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (visit?.visitorId) {
       await prisma.visitor.update({
           where: { id: visit.visitorId },
           data: { status: "CHECKED_OUT" }
       });
    }

    revalidatePath("/dashboard");
    revalidatePath("/occupancy");
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar salida." };
  }
}
