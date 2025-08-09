import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getData(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: { recordings: true },
  });
  return profile;
}

export default async function RecordingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
  if (!userId) redirect("/signin");
  const profile = await getData(userId);

  async function addRecording(formData: FormData) {
    "use server";
    if (!profile) return;
    const title = String(formData.get("title") || "");
    const url = String(formData.get("url") || "");
    const description = String(formData.get("description") || "");
    await prisma.recording.create({
      data: {
        profileId: profile.id,
        title,
        url,
        description: description || null,
      },
    });
    revalidatePath("/dashboard/recordings");
  }

  async function deleteRecording(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.recording.delete({ where: { id } });
    revalidatePath("/dashboard/recordings");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Recordings</h1>
      <form action={addRecording} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input name="title" className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">URL</label>
          <input name="url" className="w-full border rounded px-3 py-2" placeholder="https://..." required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <input name="description" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2 md:col-span-3">Add</button>
      </form>

      <div className="divide-y border rounded">
        {profile?.recordings.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">
                <a href={r.url} target="_blank" className="underline">Open</a> — {r.verificationStatus}
              </div>
            </div>
            <form action={deleteRecording}>
              <input type="hidden" name="id" value={r.id} />
              <button className="text-red-600">Delete</button>
            </form>
          </div>
        ))}
        {!profile?.recordings?.length && (
          <div className="p-4 text-gray-500">No recordings yet</div>
        )}
      </div>
    </div>
  );
}


