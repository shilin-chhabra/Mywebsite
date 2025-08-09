import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <div className="text-center my-5">
        <Image className="mb-3" src="/next.svg" alt="Logo" width={160} height={38} />
        <h1 className="display-6">Welcome to Athlete Connect</h1>
        <p className="text-muted">A year-round athletic portfolio and application portal</p>
        {session?.user ? (
          <Link className="btn btn-primary" href="/dashboard">Go to Dashboard</Link>
        ) : (
          <Link className="btn btn-outline-primary" href="/signin">Sign in</Link>
        )}
      </div>
    </div>
  );
}
