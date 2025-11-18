import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* hero section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            land your dream job with <span className="text-primary">jobpal.</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto">
            an all in one tool to help you stay organized during your job search.{" "}
            <span className="text-primary">built by students for students.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/signup">
              <button className="rounded-lg bg-primary px-8 py-3 text-background font-medium hover:cursor-pointer hover:bg-primary/90 transition-colors w-full sm:w-auto">
                get started
              </button>
            </Link>
            <Link href="/about">
              <button className="rounded-lg border border-border px-8 py-3 font-medium hover:cursor-pointer hover:bg-card transition-colors w-full sm:w-auto">
                learn more
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* about section */}
      <section className="px-6 py-32 bg-card/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">our story</h2>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
            we built jobpal to help job seekers like ourselves stay organized and focused 
            during the job search process. no more scattered spreadsheets or forgotten 
            follow-ups. just a simple, clean tool that keeps everything in one place.
          </p>
        </div>
      </section>

      {/* features section */}
      <section className="px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            what jobpal can do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">track applications</h3>
              <p className="text-foreground/70">
                keep all your job applications organized in one place. never lose track 
                of where you applied.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">set reminders</h3>
              <p className="text-foreground/70">
                stay on top of follow-ups and interviews with smart reminders that keep 
                you moving forward.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">manage contacts</h3>
              <p className="text-foreground/70">
                keep track of recruiters, hiring managers, and everyone you&apos;ve connected 
                with along the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="px-6 py-16 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-foreground/50">
            built with ❤️ by kevin chau and simon kim, two j*bless cs grads
          </p>
        </div>
      </footer>
    </main>
  );
}
