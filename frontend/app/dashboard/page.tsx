export type Summary = {
  total: number;
  SAVED: number;
  APPLIED: number;
  INTERVIEWING: number;
  OFFER: number;
  REJECTED: number;
};

export type Job = {
  id: string;
  title: string;
  company?: string | null;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  createdAt: string;
};

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard! Here you can manage your job applications and contacts.</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Your Stats</h2>
        <ul className="list-disc list-inside">
          <li>Applications Submitted: 5</li>
          <li>Interviews Scheduled: 2</li>
          <li>Offers Received: 1</li>
        </ul>
      </div>
    </div>
  );
}