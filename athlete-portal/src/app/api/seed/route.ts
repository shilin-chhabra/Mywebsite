import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const email = "demo@athlete.com";
  const password = "demo1234";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Athlete",
      hashedPassword,
      role: "ATHLETE",
      athleteProfile: {
        create: {
          sport: "Soccer",
          positions: ["Forward"],
          bio: "High school athlete looking to play at the next level.",
        },
      },
    },
    include: { athleteProfile: true },
  });

  // Seed sample academies and programs
  const admin = await prisma.user.upsert({
    where: { email: "admin@academy.com" },
    update: {},
    create: {
      email: "admin@academy.com",
      name: "Academy Admin",
      role: "ACADEMY_ADMIN",
    },
  });

  const academy = await prisma.academy.upsert({
    where: { name: "Peak Performance Academy" },
    update: {},
    create: {
      name: "Peak Performance Academy",
      description: "Elite training programs",
      website: "https://example.com/peak",
      location: "Austin, TX",
      createdByUserId: admin.id,
      programs: {
        create: [
          { name: "U18 Soccer", sport: "Soccer", description: "U18 competitive program" },
          { name: "Track Sprint", sport: "Track", description: "100m/200m sprint focus" },
        ],
      },
    },
    include: { programs: true },
  });

  return NextResponse.json({
    message: "Seeded demo athlete and sample academy/programs.",
    credentials: { email, password },
    user,
    academy,
  });
}

export async function GET() {
  return POST();
}


