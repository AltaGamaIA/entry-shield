"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function searchReservations(query: string, propertyId?: string) {
  try {
    let reservations: any[] = [];
    let visitors: any[] = [];

    if (!query || query.trim() === "") {
      if (propertyId) {
        // Fetch active reservations for this property if no query is given
        reservations = await prisma.reservation.findMany({
          where: { 
            propertyId,
            checkOut: { gte: new Date() } // Active/future ones
          },
          include: { property: true, visitors: true },
          orderBy: { checkIn: 'asc' },
          take: 10
        });
      } else {
        return { success: true, reservations: [] };
      }
    } else {
      const searchTerm = query.trim();
      reservations = await prisma.reservation.findMany({
        where: {
          OR: [
            { guestName: { contains: searchTerm } },
            { id: { contains: searchTerm } }
          ],
          ...(propertyId ? { propertyId } : {})
        },
        include: { property: true, visitors: true },
        take: 10
      });

      visitors = await prisma.visitor.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { documentId: { contains: searchTerm } }
          ],
        },
        include: { visits: { where: { checkOutTime: null } } },
        take: 10
      });
    }

    // Unify
    const unifiedResults = [
      ...reservations.map(r => ({
        id: r.id,
        guestName: r.guestName,
        type: 'RESERVATION',
        status: 'Esperado',
        original: r
      })),
      ...visitors.map(v => ({
        id: `vis-${v.id}`,
        guestName: v.name,
        type: 'VISITOR',
        status: v.visits.length > 0 ? 'En Instalaciones' : 'Registrado (Pasado)',
        original: v
      }))
    ];

    return { success: true, reservations: unifiedResults };
  } catch (error: any) {
    console.error("Error searching reservations:", error);
    return { success: false, error: "Hubo un error al buscar reservas." };
  }
}

export async function createReservation(data: { guestName: string; propertyId: string; checkIn: Date; checkOut: Date; visitorPolicy?: string }) {
  try {
    const res = await prisma.reservation.create({
      data: {
        guestName: data.guestName,
        propertyId: data.propertyId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        visitorPolicy: data.visitorPolicy || ""
      }
    });
    return { success: true, reservation: res };
  } catch (error: any) {
    console.error("Error creating reservation:", error);
    return { success: false, error: "No se pudo crear la reserva." };
  }
}

export async function updateReservation(id: string, data: { guestName?: string; checkIn?: Date; checkOut?: Date; visitorPolicy?: string }) {
  try {
    const res = await prisma.reservation.update({
      where: { id },
      data
    });
    return { success: true, reservation: res };
  } catch (error: any) {
    console.error("Error updating reservation:", error);
    return { success: false, error: "No se pudo actualizar la reserva." };
  }
}

export async function deleteReservation(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return { success: false, error: "No autorizado. Solo los administradores pueden eliminar registros." };
    }

    const visitors = await prisma.visitor.findMany({ where: { reservationId: id } });
    const visitorIds = visitors.map(v => v.id);

    const visits = await prisma.visit.findMany({ where: { visitorId: { in: visitorIds } } });
    const visitIds = visits.map(v => v.id);

    // 1. Delete Incidents
    await prisma.incident.deleteMany({
      where: { visitId: { in: visitIds } }
    });

    // 2. Delete Visits
    await prisma.visit.deleteMany({
      where: { visitorId: { in: visitorIds } }
    });

    // 3. Delete Visitors
    await prisma.visitor.deleteMany({
      where: { reservationId: id }
    });
    
    // 4. Delete Reservation
    await prisma.reservation.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting reservation:", error);
    return { success: false, error: "No se pudo eliminar la reserva." };
  }
}
