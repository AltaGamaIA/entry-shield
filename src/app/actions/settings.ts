"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getComplianceSettings(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    if (!property || !property.config) return null;
    return JSON.parse(property.config);
  } catch (error) {
    return null;
  }
}

export async function updateComplianceSettings(propertyId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "No autorizado." };
    }

    const retentionPeriod = formData.get("retentionPeriod") as string;
    const maskData = formData.get("maskData") === "true";
    const consentText = formData.get("consentText") as string;

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) return { success: false, error: "Propiedad no encontrada." };

    let currentConfig = {};
    if (property.config) {
      try {
        currentConfig = JSON.parse(property.config);
      } catch (e) {}
    }

    const newConfig = {
      ...currentConfig,
      compliance: {
        retentionPeriod: retentionPeriod || "Tras 30 Días",
        maskSensitiveData: maskData,
        consentText: consentText || "Por la presente doy mi consentimiento para la recopilación y procesamiento de mis datos personales con el fin de gestionar la seguridad del edificio y las visitas, de acuerdo con la ley local de protección de datos.",
      }
    };

    await prisma.property.update({
      where: { id: propertyId },
      data: { config: JSON.stringify(newConfig) }
    });

    revalidatePath("/compliance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar la configuración." };
  }
}

export async function updateShiftProtocol(propertyId: string, protocolText: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "No autorizado." };

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return { success: false, error: "Propiedad no encontrada." };

    let currentConfig: any = {};
    if (property.config) {
      try {
        currentConfig = JSON.parse(property.config);
      } catch (e) {}
    }

    currentConfig.shiftProtocol = protocolText;

    await prisma.property.update({
      where: { id: propertyId },
      data: { config: JSON.stringify(currentConfig) }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al actualizar." };
  }
}

export async function exportComplianceAudit() {
  try {
     const session = await getServerSession(authOptions);
     if (!session || !session.user) return { success: false, error: "No autorizado" };

     const incidents = await prisma.incident.findMany({
       take: 100,
       orderBy: { createdAt: 'desc' },
       include: { visit: { include: { visitor: true } } }
     });

     let csv = "ID,SEVERIDAD,DESCRIPCION,VISITANTE,FECHA\n";
     incidents.forEach(inc => {
       const visitorName = inc.visit?.visitor?.name || "N/A";
       csv += `"${inc.id}","${inc.severity}","${inc.description.replace(/"/g, '""')}","${visitorName}","${inc.createdAt.toISOString()}"\n`;
     });

     return { success: true, csvData: csv };
  } catch (error) {
     return { success: false, error: "Error al generar la auditoría de cumplimiento." };
  }
}
