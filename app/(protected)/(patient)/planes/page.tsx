export default function PlansPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-[28px] border border-border/60 bg-card px-6 py-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#2E85C8]">
            Planes
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Próximamente
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Esta pantalla va a concentrar las opciones de suscripción y los beneficios de cada plan.
            Ya dejamos la ruta preparada para conectar el flujo desde el simplificador.
          </p>
        </div>
      </div>
    </div>
  )
}
