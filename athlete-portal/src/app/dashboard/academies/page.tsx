import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AcademiesPage() {
  const academies = await prisma.academy.findMany({
    include: { programs: true },
    orderBy: { name: "asc" },
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Browse Academies</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {academies.map((a) => (
          <div key={a.id} className="border rounded p-4 space-y-2">
            <div className="text-lg font-medium">{a.name}</div>
            {a.website && (
              <a href={a.website} target="_blank" className="text-sm underline">Website</a>
            )}
            <div className="text-sm text-gray-500">{a.location}</div>
            <div className="text-sm">Programs:</div>
            <ul className="list-disc ml-5">
              {a.programs.map((p) => (
                <li key={p.id}>
                  {p.name} – {p.sport} {" "}
                  <Link href={`/dashboard/applications?programId=${p.id}`} className="underline">Apply</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!academies.length && <div className="text-gray-500">No academies yet</div>}
      </div>
    </div>
  );
}


