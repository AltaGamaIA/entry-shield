"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePropertyConfig(propertyId: string, config: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: "Unauthorized. Requires ADMIN role." };
  }

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { config: JSON.stringify(config) }
    });
    
    // Invalidate dashboard and rules cache to show new settings
    revalidatePath("/dashboard");
    revalidatePath("/rules");

    return { success: true };
  } catch (error) {
    console.error("Error saving property config:", error);
    return { success: false, error: "Database error." };
  }
}
