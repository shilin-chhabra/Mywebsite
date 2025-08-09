import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getData(userId: string) {
  const apps = await prisma.application.findMany({
    where: { athleteUserId: userId },
    include: { program: { include: { academy: true } } },
    orderBy: { createdAt: "desc" },
  });
  const programs = await prisma.program.findMany({
    include: { academy: true },
    orderBy: { name: "asc" },
    take: 100,
  });
  return { apps, programs };
}

export default async function ApplicationsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const session = await getServerSession(authOptions);
  const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
  if (!userId) redirect("/signin");
  const { apps, programs } = await getData(userId);

  async function createApplication(formData: FormData) {
    "use server";
    const programId = String(formData.get("programId"));
    if (!programId) return;
    await prisma.application.create({
      data: {
        athleteUserId: userId!,
        programId,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
    revalidatePath("/dashboard/applications");
  }

  async function withdraw(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.application.update({ where: { id }, data: { withdrawn: true } });
    revalidatePath("/dashboard/applications");
  }

  const spValue = searchParams.programId;
  const initialProgramId = Array.isArray(spValue)
    ? spValue[0] ?? ""
    : spValue ?? "";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Applications</h1>

      <form action={createApplication} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Select Program</label>
          <select name="programId" defaultValue={initialProgramId} className="w-full border rounded px-3 py-2">
            <option value="">-- Choose a program --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.academy.name} – {p.name} ({p.sport})
              </option>
            ))}
          </select>
        </div>
        <button className="bg-black text-white rounded px-4 py-2" disabled={!programs.length}>
          Apply
        </button>
      </form>

      <div className="divide-y border rounded">
        {apps.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{a.program.academy.name} – {a.program.name}</div>
              <div className="text-sm text-gray-500">Status: {a.status} {a.withdrawn ? "(withdrawn)" : ""}</div>
            </div>
            {!a.withdrawn && (
              <form action={withdraw}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-red-600">Withdraw</button>
              </form>
            )}
          </div>
        ))}
        {!apps.length && <div className="p-4 text-gray-500">No applications yet</div>}
      </div>
    </div>
  );
}


