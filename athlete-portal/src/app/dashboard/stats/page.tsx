import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getStats(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: { stats: true },
  });
  return profile;
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
  if (!userId) redirect("/signin");
  const profile = await getStats(userId);

  async function addStat(formData: FormData) {
    "use server";
    const category = String(formData.get("category") || "General");
    const name = String(formData.get("name") || "");
    const unit = String(formData.get("unit") || "");
    const valueNumber = formData.get("valueNumber");
    const valueString = String(formData.get("valueString") || "");
    if (!profile) return;
    await prisma.stat.create({
      data: {
        profileId: profile.id,
        category,
        name,
        unit: unit || null,
        valueNumber: valueNumber ? Number(valueNumber) : null,
        valueString: valueString || null,
      },
    });
    revalidatePath("/dashboard/stats");
  }

  async function deleteStat(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.stat.delete({ where: { id } });
    revalidatePath("/dashboard/stats");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Stats</h1>
      <form action={addStat} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <input name="category" className="w-full border rounded px-3 py-2" defaultValue="General" />
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Unit</label>
          <input name="unit" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Value</label>
          <input name="valueNumber" className="w-full border rounded px-3 py-2" placeholder="e.g. 12.5" />
          <input name="valueString" className="w-full border rounded px-3 py-2 mt-1" placeholder="or 'Excellent'" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2">Add</button>
      </form>

      <div className="divide-y border rounded">
        {profile?.stats.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{s.category} • {s.name}</div>
              <div className="text-sm text-gray-500">{s.valueNumber ?? s.valueString} {s.unit ?? ""} — {s.verificationStatus}</div>
            </div>
            <form action={deleteStat}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-red-600">Delete</button>
            </form>
          </div>
        ))}
        {!profile?.stats?.length && (
          <div className="p-4 text-gray-500">No stats yet</div>
        )}
      </div>
    </div>
  );
}


