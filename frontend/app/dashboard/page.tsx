"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Job = { id: string; title: string; company?: string | null; status: string; createdAt: string };
type Contact = { id: string; name: string; email?: string | null; company?: string | null; createdAt: string };

async function getJobs(limit = 100) {
  const { items } = await api<{ items: Job[]; nextCursor: string | null }>(`/api/jobs?limit=${limit}`);
  return items || [];
}

async function getContacts(limit = 100) {
  const { items } = await api<{ items: Contact[]; nextCursor: string | null }>(`/api/contacts?limit=${limit}`);
  return items || [];
}


export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsData, contactsData] = await Promise.all([
        getJobs(),
        getContacts(),
      ]);
      setJobs(jobsData);
      setContacts(contactsData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <main className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </main>
    );
  }

  // Ensure contacts is always an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  
  // Compute totals from the data we already have
  const totalApps = jobs.length;
  const totalContacts = safeContacts.length;  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className=" mt-1">Track your job search progress</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPI label="Total Applications" value={totalApps} />
          <KPI label="Total Contacts" value={totalContacts} />
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Jobs</h2>
              <Link
                className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                href="/dashboard/jobs"
              >
                View all →
              </Link>
            </div>

            <Card>
              {jobs.length === 0 ? (
                <Empty text="No jobs yet. Add your first application." />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {jobs.slice(0, 3).map((j) => (
                    <li key={j.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{j.title}</div>
                          <div className="text-sm  mt-1">{j.company || "—"}</div>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(j.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {jobs.length === 0 && (
              <Link
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                href="/dashboard/jobs"
              >
                Add your first job →
              </Link>
            )}
          </div>

          {/* Recent Contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Contacts</h2>
              <Link
                className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                href="/dashboard/contacts"
              >
                View all →
              </Link>
            </div>

            <Card>
              {safeContacts.length === 0 ? (
                <Empty text="No contacts yet. Add a recruiter or hiring manager." />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {safeContacts.slice(0, 3).map((c) => (
                    <li key={c.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-sm  mt-1">
                        {c.company || "—"}
                        {c.email && (
                          <>
                            <span className="mx-1.5">•</span>
                            <span className="text-gray-500">{c.email}</span>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {safeContacts.length === 0 && (
              <Link
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                href="/dashboard/contacts"
              >
                Add your first contact →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* tiny presentational bits to keep the page tidy */
function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm p-2 shadow-sm bg-card border border-border">
      <p className="text-sm ">{label}</p>
      <p className="mt-2 text-3xl font-semibold ">{value}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm shadow-sm bg-card border border-border">
      <div className="p-5">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-sm ">{text}</div>;
}
