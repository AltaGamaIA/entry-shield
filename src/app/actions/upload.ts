"use server";

import fs from "fs";
import path from "path";

export async function uploadSelfieBase64(base64Image: string, visitorId?: string) {
  try {
    // Vercel Serverless Hack: Instead of writing to the local `/public/uploads` directory (which crashes because Serverless is read-only),
    // we bypass the file system entirely and pass the optimized DataURI directly to the Database to be saved as TEXT.
    return { success: true, url: base64Image, visitorId };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { success: false, error: "Error al capturar la fotografía." };
  }
}

export async function uploadIdCardBase64(base64Image: string, visitorId?: string) {
  try {
    return { success: true, url: base64Image, visitorId };
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return { success: false, error: "Error al capturar el documento." };
  }
}
