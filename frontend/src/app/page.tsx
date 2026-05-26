export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Bem-vindo ao <span className="text-primary-500">Second Brain</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          O setup inicial da arquitetura foi concluído. Next.js, Tailwind,
          Tanstack Query e Dark Mode configurados!
        </p>
      </div>
    </main>
  );
}
