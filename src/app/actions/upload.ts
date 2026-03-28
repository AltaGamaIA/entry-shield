"use server";

import fs from "fs";
import path from "path";

export async function uploadSelfieBase64(base64Image: string, visitorId?: string) {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `selfie_${visitorId || Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);

    return { success: true, url: `/uploads/${filename}`, visitorId };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { success: false, error: "Error al guardar la fotografía." };
  }
}

export async function uploadIdCardBase64(base64Image: string, visitorId?: string) {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `idcard_${visitorId || Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);

    return { success: true, url: `/uploads/${filename}`, visitorId };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { success: false, error: "Error al guardar el documento." };
  }
}
