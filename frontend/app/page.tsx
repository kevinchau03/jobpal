import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold">welcome to <span className="underline text-accent">jobpal</span></h1>
        <p>an all in one tool to help you land your dream job.</p>
        <Link href="/signup">
          <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">Get Started</button>
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">my story</h2>
        <p>long story short. i built this tool to help job seekers like myself stay organized and focused during the job search process.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">what jobpal can do</h2>
        <ul>
          <li>track your job applications</li>
          <li>set reminders for follow ups and interviews</li>
          <li>track who you've reached out to</li>
        </ul>
      </section>

      <footer>
        <p>built with ❤️ by kevin chau</p>
      </footer>
    </main>
  );
}
