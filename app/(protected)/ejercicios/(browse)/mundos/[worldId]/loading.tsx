export default function WorldLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 max-w-2xl mx-auto">
      <div className="h-8 w-20 rounded-xl bg-muted/40 animate-pulse" />
      <div className="h-12 rounded-xl bg-muted/30 animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-16 rounded-2xl bg-muted/25 animate-pulse ${i % 2 === 0 ? "w-[92%] mr-auto" : "w-[92%] ml-auto"}`}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
