import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVisitorDocuments } from "@/app/actions/documents";
import DocumentListClient from "@/components/DocumentListClient";

export const metadata = { title: "Documentos de Identidad | EntryShield" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const result = await getVisitorDocuments();
  const visitors = result.success && result.visitors ? (result.visitors as any[]) : [];

  return <DocumentListClient visitors={visitors} />;
}
