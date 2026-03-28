"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createIncident(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "No autorizado." };
    }

    const description = formData.get("description") as string;
    const severity = formData.get("severity") as string || "LOW";
    const visitId = formData.get("visitId") as string | null;

    if (!description || description.trim().length === 0) {
      return { success: false, error: "La descripción es obligatoria." };
    }

    // `evidenceUrls` is required by schema, but we don't have file uploads yet in the incident form.
    const incidentData: Record<string, any> = {
      description: description.trim(),
      severity,
      evidenceUrls: JSON.stringify([]),
    };

    if (visitId && visitId !== "null" && visitId !== "") {
      incidentData.visitId = visitId;
    }

    await prisma.incident.create({
      data: incidentData as any,
    });

    revalidatePath("/incidents/report");
    revalidatePath("/reports/admin");
    return { success: true };
  } catch (error: unknown) {
    console.error("Incident Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al crear el incidente." };
  }
}
