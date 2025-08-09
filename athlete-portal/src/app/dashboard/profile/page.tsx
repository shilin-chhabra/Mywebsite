import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { athleteProfile: true },
  });
  return user;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
  if (!userId) redirect("/signin");

  const user = await getData(userId);
  if (!user) redirect("/signin");

  async function updateProfile(formData: FormData) {
    "use server";

    const profileSchema = z.object({
      name: z.string().trim().min(1).max(100),
      sport: z.string().trim().max(100).optional().or(z.literal("")),
      positions: z.string().trim().optional().or(z.literal("")),
      bio: z.string().trim().max(2000).optional().or(z.literal("")),
      heightCm: z.string().optional().or(z.literal("")),
      weightKg: z.string().optional().or(z.literal("")),
      graduationYear: z.string().optional().or(z.literal("")),
      location: z.string().trim().max(200).optional().or(z.literal("")),
      primaryEmail: z.string().email().optional().or(z.literal("")),
      phone: z.string().trim().max(50).optional().or(z.literal("")),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      instagramUrl: z.string().url().optional().or(z.literal("")),
      youtubeUrl: z.string().url().optional().or(z.literal("")),
    });

    const raw = Object.fromEntries(formData.entries());
    const parsed = profileSchema.parse(raw);
    const toNumber = (v?: string) => (v && v !== "" ? Number(v) : null);
    const positions = parsed.positions
      ? parsed.positions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    await prisma.user.update({
      where: { id: userId! },
      data: {
        name: parsed.name,
        athleteProfile: {
          upsert: {
            update: {
              sport: parsed.sport || null,
              positions: positions.length ? positions : [],
              bio: parsed.bio || null,
              heightCm: toNumber(parsed.heightCm) ?? undefined,
              weightKg: toNumber(parsed.weightKg) ?? undefined,
              graduationYear: toNumber(parsed.graduationYear) ?? undefined,
              location: parsed.location || null,
              primaryEmail: parsed.primaryEmail || null,
              phone: parsed.phone || null,
              websiteUrl: parsed.websiteUrl || null,
              instagramUrl: parsed.instagramUrl || null,
              youtubeUrl: parsed.youtubeUrl || null,
            },
            create: {
              sport: parsed.sport || null,
              positions: positions.length ? positions : [],
              bio: parsed.bio || null,
              heightCm: toNumber(parsed.heightCm) ?? undefined,
              weightKg: toNumber(parsed.weightKg) ?? undefined,
              graduationYear: toNumber(parsed.graduationYear) ?? undefined,
              location: parsed.location || null,
              primaryEmail: parsed.primaryEmail || null,
              phone: parsed.phone || null,
              websiteUrl: parsed.websiteUrl || null,
              instagramUrl: parsed.instagramUrl || null,
              youtubeUrl: parsed.youtubeUrl || null,
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/profile");
  }

  const profile = user.athleteProfile;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>
      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input name="name" defaultValue={user.name ?? ""} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Sport</label>
            <input name="sport" defaultValue={profile?.sport ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Positions (comma separated)</label>
            <input name="positions" defaultValue={Array.isArray(profile?.positions) ? (profile!.positions as string[]).join(", ") : ""} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea name="bio" defaultValue={profile?.bio ?? ""} className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Height (cm)</label>
            <input name="heightCm" defaultValue={profile?.heightCm ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Weight (kg)</label>
            <input name="weightKg" defaultValue={profile?.weightKg ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Graduation Year</label>
            <input name="graduationYear" defaultValue={profile?.graduationYear ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input name="location" defaultValue={profile?.location ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Primary Email</label>
            <input name="primaryEmail" defaultValue={profile?.primaryEmail ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input name="phone" defaultValue={profile?.phone ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Website</label>
            <input name="websiteUrl" defaultValue={profile?.websiteUrl ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Instagram</label>
            <input name="instagramUrl" defaultValue={profile?.instagramUrl ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">YouTube</label>
            <input name="youtubeUrl" defaultValue={profile?.youtubeUrl ?? ""} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" className="bg-black text-white rounded px-4 py-2">Save</button>
      </form>
    </div>
  );
}


