import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function ResearchBrief({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  if (!validSession((await cookies()).get("mmi_session")?.value)) redirect("/");
  const { project } = await searchParams;
  const params = new URLSearchParams({ view: "reports" });
  if (project) params.set("project", project);
  redirect("/?" + params.toString());
}
