const TITLE = "¿Quién puede usar LISA?"

const TEXT1 =
  "Profesionales de la psicopedagogía y equipos clínicos pueden trabajar con textos clasificados según su nivel real de dificultad, diseñar progresiones controladas y abordar fluidez, procesamiento léxico y comprensión con base en evidencia."

const TEXT2 =
  "Familias que acompañan procesos de lectura, especialmente en casos de dislexia, encuentran materiales accesibles organizados por nivel, que permiten sostener el trabajo en casa con criterios claros y coherentes."

export function WhoCanUseLisaSection() {
  return (
    <section
      className="relative h-screen overflow-hidden"
      style={{ backgroundColor: "#2E85C8", marginTop: "-2px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-16">
        <div className="max-w-3xl w-full flex flex-col items-center gap-10">
          <h2 className="text-center text-white text-4xl sm:text-5xl md:text-6xl font-extralight leading-tight">
            {TITLE}
          </h2>
          <p className="text-center text-white/90 text-xl sm:text-2xl font-extralight leading-relaxed">
            {TEXT1}
          </p>
          <p className="text-center text-white text-xl sm:text-2xl font-extralight leading-relaxed">
            {TEXT2}
          </p>
        </div>
      </div>
    </section>
  )
}
