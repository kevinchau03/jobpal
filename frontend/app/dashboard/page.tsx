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
        <h1>Statistic Overview</h1>
        <p>Summary of your job applications will be displayed here.</p>
      </div>
      <div className="mt-6">
        <h1>Recent Job Applications</h1>
        <p>Your most recent job applications will be displayed here.</p>
      </div>
      <div className="mt-6">
        <h1>Recent Contacts</h1>
        <p>Your most recent contacts will be displayed here.</p>
      </div>
      <div className="mt-6">
        <h1>Here are some great resources to help you get started:</h1>
        <a href="#" className="text-blue-500 hover:underline">Resource 1</a>
        <a href="#" className="text-blue-500 hover:underline">Resource 2</a>
        <a href="#" className="text-blue-500 hover:underline">Resource 3</a>
        <a href="#" className="text-blue-500 hover:underline">Join the Discord!</a>
      </div>
    </div>
  );
}