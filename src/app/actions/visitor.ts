"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerVisitor(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "No autorizado." };
    }

    const name = formData.get("name") as string;
    const documentType = formData.get("documentType") as string;
    const documentId = formData.get("documentId") as string;
    const status = formData.get("status") as string;
    const staffId = session.user.staffId;

    if (!name || !documentId) {
      return { success: false, error: "Nombre y Documento son obligatorios." };
    }

    const formReservationId = formData.get("reservationId") as string;
    let targetReservationId = formReservationId;

    if (!targetReservationId) {
      // Default Fallback Property for Walk-ins
      let property = await prisma.property.findFirst({
          where: { name: "Alpha Heights" }
      });

      if (!property) {
          property = await prisma.property.create({
              data: { name: "Alpha Heights", address: "Central Hub" }
          });
      }

      // Default Fallback Reservation for Walk-ins
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let reservation = await prisma.reservation.findFirst({
        where: { 
            propertyId: property.id,
            guestName: "Ingresos Directos (Sin Reserva Previa)",
        }
      });

      if (!reservation) {
          reservation = await prisma.reservation.create({
              data: {
                  propertyId: property.id,
                  guestName: "Ingresos Directos (Sin Reserva Previa)",
                  checkIn: today,
                  checkOut: new Date(today.getTime() + 24 * 60 * 60 * 1000 * 365), // 1 year
                  visitorPolicy: "Registro Presencial Inmediato",
              }
          });
      }
      targetReservationId = reservation.id;
    }

    const idCardUrl = formData.get("idCardUrl") as string;
    const selfieUrl = formData.get("selfieUrl") as string;
    const approximateAge = formData.get("approximateAge") as string;

    // 1. Create the Visitor
    const visitor = await prisma.visitor.create({
      data: {
        reservationId: targetReservationId,
        name,
        documentType: documentType || "CC",
        documentId,
        status: status || "PENDING",
        ...(approximateAge ? { approximateAge } : {}),
        ...(idCardUrl ? { idCardUrl } : {}),
        ...(selfieUrl ? { selfieUrl } : {}),
      },
    });

    if (status === "DENIED" || status === "FLAGGED") {
      const { triggerSecurityAlert } = await import('@/app/actions/webhook');
      let reason = "Política Automática de Seguridad Vulnerada";
      if (approximateAge === "Menor") reason = "Intento de Ingreso de Menor de Edad sin Acreditación";
      
      await triggerSecurityAlert(name, reason, targetReservationId); // Send alert async
    }

    // 2. Create the Visit Log if Status is "inside"
    if (status === "inside") {
      await prisma.visit.create({
        data: {
          visitorId: visitor.id,
          staffId: staffId,
          checkInTime: new Date(),
        },
      });
    } else {
        // Just log the Pending/Denied entry with checkout equal to checkin to signal failure or waiting
        await prisma.visit.create({
            data: {
              visitorId: visitor.id,
              staffId: staffId,
              checkInTime: new Date(),
              checkOutTime: status === "denied" ? new Date() : null, 
            },
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/occupancy");
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar visitante." };
  }
}

export async function deleteVisitor(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return { success: false, error: "No autorizado. Solo los administradores pueden eliminar registros." };
    }

    const visits = await prisma.visit.findMany({ where: { visitorId: id } });
    const visitIds = visits.map(v => v.id);

    await prisma.incident.deleteMany({
      where: { visitId: { in: visitIds } }
    });

    // Delete any associated visits first
    await prisma.visit.deleteMany({
      where: { visitorId: id }
    });
    
    await prisma.visitor.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting visitor:", error);
    return { success: false, error: "No se pudo eliminar el invitado." };
  }
}
