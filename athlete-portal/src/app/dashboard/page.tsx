import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Unauthorized</h1>
        <p className="mb-4">You must sign in to access the dashboard.</p>
        <Link className="underline" href="/signin">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="h3 mb-4">Welcome, {session.user.name ?? "Athlete"}</h1>
      <div className="row g-3">
        <div className="col-md-4">
          <Link className="card text-decoration-none" href="/dashboard/profile">
            <div className="card-body">Edit Profile</div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link className="card text-decoration-none" href="/dashboard/stats">
            <div className="card-body">Manage Stats</div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link className="card text-decoration-none" href="/dashboard/recordings">
            <div className="card-body">Manage Recordings</div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link className="card text-decoration-none" href="/dashboard/academies">
            <div className="card-body">Browse Academies</div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link className="card text-decoration-none" href="/dashboard/applications">
            <div className="card-body">My Applications</div>
          </Link>
        </div>
      </div>
    </div>
  );
}


