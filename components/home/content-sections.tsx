"use client"

import { ScrollReveal } from "./scroll-reveal"

const FEATURES = [
    {
        title: "Índice de Dificultad Lectora",
        description:
            "Una fórmula propia que analiza frecuencia, complejidad y carga cognitiva de cada texto para clasificarlo según su nivel real de dificultad.",
        accent: "#C73341",
    },
    {
        title: "Ejercicios de intervención",
        description:
            "Actividades diseñadas por psicopedagogas que trabajan fluidez, procesamiento léxico y comprensión lectora de forma progresiva.",
        accent: "#2E85C8",
    },
    {
        title: "Seguimiento personalizado",
        description:
            "Cada profesional accede al progreso de sus pacientes en tiempo real, ajustando las actividades según la evolución de cada uno.",
        accent: "#E8A838",
    },
]

export function ContentSections() {
    return (
        <div
            className="relative"
            style={{
                background:
                    "radial-gradient(ellipse 130% 90% at 50% 45%, #fdf9f4 0%, #faf3ea 50%, #f6ece0 100%)",
            }}
        >
            <section className="max-w-4xl mx-auto px-6 sm:px-12 py-32 sm:py-40">
                <ScrollReveal>
                    <p className="text-center text-neutral-500 text-lg sm:text-xl md:text-2xl font-extralight leading-relaxed max-w-2xl mx-auto">
                        Diseñamos recursos para ampliar el acceso a la lectura.
                    </p>
                </ScrollReveal>

                <div className="mt-24 sm:mt-32 space-y-20 sm:space-y-28">
                    {FEATURES.map((feature, i) => (
                        <ScrollReveal
                            key={feature.title}
                            direction={i % 2 === 0 ? "left" : "right"}
                            delay={0.1}
                        >
                            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-8">
                                <div
                                    className="shrink-0 w-1 sm:w-1.5 h-16 sm:h-20 rounded-full mt-1"
                                    style={{ backgroundColor: feature.accent }}
                                />
                                <div className="space-y-3">
                                    <h3
                                        className="text-xl sm:text-2xl font-semibold tracking-tight"
                                        style={{ color: feature.accent }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p className="text-neutral-600 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
                <ScrollReveal>
                    <blockquote className="text-center">
                        <p className="text-2xl sm:text-3xl md:text-4xl font-extralight text-neutral-700 leading-relaxed italic">
                            &ldquo;Cada niño merece textos que pueda leer, entender y disfrutar.&rdquo;
                        </p>
                    </blockquote>
                </ScrollReveal>
            </section>
        </div>
    )
}