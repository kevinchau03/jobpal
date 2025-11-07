import { cookies } from "next/headers";
import { Briefcase, Building2, Calendar, Circle } from "lucide-react";

type Job = { 
  id: string; 
  title: string; 
  company?: string | null; 
  status: string; 
  createdAt: string 
};

const statusColors = {
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  default: "bg-gray-100 text-gray-700"
};

export default async function JobsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

  const res = await fetch("http://localhost:4000/api/jobs?limit=20", {
    headers: { cookie: cookieHeader },
    cache: "no-store", 
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Failed to load jobs
        </div>
      </div>
    );
  }

  const { items: jobs } = (await res.json()) as { items: Job[]; nextCursor: string | null };
  
  return (
    <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className=" mt-2">{jobs.length} {jobs.length === 1 ? 'application' : 'applications'}</p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4" />
            <p className="">No jobs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => {
              const statusKey = job.status.toLowerCase() as keyof typeof statusColors;
              const statusColor = statusColors[statusKey] || statusColors.default;
              
              return (
                <div 
                  key={job.id} 
                  className="bg-card rounded-sm shadow-sm p-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-2">
                        {job.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm ">
                        {job.company && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColor}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}