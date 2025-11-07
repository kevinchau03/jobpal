import { cookies } from "next/headers";

type Job = { id: string; title: string; company?: string | null; status: string; createdAt: string };

export default async function JobsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  const res = await fetch("http://localhost:4000/api/jobs?limit=20", {
    headers: { cookie: cookieHeader },
    cache: "no-store", 
  });

  if (!res.ok) {
    return <div className="p-6 text-red-600">Failed to load jobs</div>;
  }

  const { items: jobs } = (await res.json()) as { items: Job[]; nextCursor: string | null };
  return <div className="p-6">{jobs.length === 0 ? <p>No jobs found.</p> : jobs.map(job => (
    <div key={job.id} className="border-b border-gray-200 py-4">
      <h3 className="text-lg font-semibold">{job.title}</h3>
      <p className="text-sm text-gray-500">{job.company}</p>
      <p className="text-sm text-gray-500">{job.status}</p>
      <p className="text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
    </div>
  ))}</div>;
}
