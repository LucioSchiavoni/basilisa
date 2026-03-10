"use client";
import Link from "next/link";
import { useState, useRef, useId, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, BookOpen, X } from "lucide-react";

export interface WorldData {
    id: string;
    name: string;
    displayName: string;
    description: string;
    iconUrl: string;
    difficultyLevel: number;
    difficultyLabel: string;
    therapeuticDescription: string;
    totalExercises: number;
    completedExercises: number;
    lore?: string;
}

/* ─── Progress bar ─────────────────────────────────────────── */
const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
        <div className="px-5 pt-5">
            <div className="flex justify-between text-[10px] text-white/60 mb-1 font-sans">
                <span>Progreso</span>
                <span>{completed}/{total}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                    className="h-full rounded-full bg-white/70 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

/* ─── Difficulty Badge (vertical, side) ────────────────────── */
const DifficultyBadge = ({ level, label }: { level: number; label: string }) => (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 py-3 px-2.5 rounded-l-xl"
        style={{ background: "rgba(20,14,10,0.62)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.14)" }}
    >
        <span
            className="text-white font-semibold font-sans uppercase tracking-widest text-[9px]"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
            {label}
        </span>
        <div className="w-px h-3 bg-white/20 rounded-full" />
        <div className="flex flex-col items-center gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
                <span
                    key={i}
                    className="text-[13px] leading-none select-none"
                    style={{
                        color: i < level ? "#FFD700" : "rgba(255,255,255,0.22)",
                        textShadow: i < level ? "0 0 6px rgba(255,220,0,0.85)" : "none",
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    </div>
);

/* ─── Lore modal ────────────────────────────────────────────── */
const LoreModal = ({
    lore,
    description,
    worldName,
    open,
    onClose,
}: {
    lore?: string;
    description: string;
    worldName: string;
    open: boolean;
    onClose: () => void;
}) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-6"
            style={{ background: "rgba(10,8,6,0.72)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="relative w-full md:max-w-lg md:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col"
                style={{
                    background: "linear-gradient(160deg, #1c1208 0%, #0f0a05 100%)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
                    maxHeight: "80dvh",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar mobile */}
                <div className="flex md:hidden justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-amber-300/80" />
                        <span className="text-amber-200/90 font-semibold text-sm font-[family-name:var(--font-lexend)] tracking-wide">
                            {worldName}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-white/10 text-white/50 hover:text-white/90"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="overflow-y-auto px-6 pb-8"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}
                >
                    <p className="text-white/85 text-lg leading-9 text-pretty font-[family-name:var(--font-lexend)]">
                        {lore || description}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

/* ─── Slide ─────────────────────────────────────────────────── */
interface SlideProps {
    slide: WorldData;
    index: number;
    current: number;
    handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
    const slideRef = useRef<HTMLLIElement>(null);
    const xRef = useRef(0);
    const yRef = useRef(0);
    const frameRef = useRef<number | undefined>(undefined);
    const [showLore, setShowLore] = useState(false);

    useEffect(() => {
        if (current !== index) setShowLore(false);
    }, [current, index]);

    useEffect(() => {
        const animate = () => {
            if (!slideRef.current) return;
            slideRef.current.style.setProperty("--x", `${xRef.current}px`);
            slideRef.current.style.setProperty("--y", `${yRef.current}px`);
            frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const handleMouseMove = (event: React.MouseEvent) => {
        const el = slideRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
        yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
    };

    const handleMouseLeave = () => {
        xRef.current = 0;
        yRef.current = 0;
    };

    const isActive = current === index;

    return (
        <div className="[perspective:1200px] [transform-style:preserve-3d]">
            <li
                ref={slideRef}
                className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] max-[600px]:w-[80vw] max-[600px]:h-[108vw] mx-[4vmin] z-10 cursor-pointer overflow-visible"
                onClick={() => handleSlideClick(index)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: isActive
                        ? "scale(1) rotateX(0deg)"
                        : "scale(0.97) rotateX(8deg)",
                    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    transformOrigin: "bottom",
                }}
            >
                {/* Book pages stack — peek out from right edge */}
                {[4, 3, 2, 1].map((i) => (
                    <div
                        key={i}
                        className="absolute rounded-2xl"
                        style={{
                            top: `${i * 0.75}%`,
                            height: `${100 - i * 1.5}%`,
                            left: `${i * 7}px`,
                            width: "100%",
                            zIndex: 5 - i,
                            background: i % 2 === 0
                                ? "linear-gradient(to bottom, #F0E5C8, #E8D9B0)"
                                : "linear-gradient(to bottom, #FFF8E8, #F5EDD0)",
                            boxShadow: "3px 0 8px rgba(0,0,0,0.18), inset -1px 0 2px rgba(0,0,0,0.08)",
                        }}
                    />
                ))}

                {/* Card shell — todo el contenido va aquí para que el hover los mueva juntos */}
                <div
                    className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden transition-all duration-150 ease-out"
                    style={{
                        zIndex: 5,
                        boxShadow: isActive
                            ? "0 0 0 2px rgba(255,245,220,0.18), 0 20px 60px rgba(0,0,0,0.45)"
                            : "0 8px 32px rgba(0,0,0,0.3)",
                        transform: isActive
                            ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                            : "none",
                    }}
                >
                    {/* Background image */}
                    <img
                        className="absolute inset-0 w-[120%] h-[120%] object-cover transition-opacity duration-600 ease-in-out"
                        style={{ opacity: isActive ? 1 : 0.55 }}
                        alt={slide.displayName}
                        src={slide.iconUrl}
                        loading="eager"
                        decoding="sync"
                    />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                    {/* Lore modal */}
                    <LoreModal
                        lore={slide.lore}
                        description={slide.description}
                        worldName={slide.displayName}
                        open={showLore}
                        onClose={() => setShowLore(false)}
                    />

                    {/* ── UI content (moves with card on hover) ── */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}>

                        {/* Header: progress bar */}
                        <div
                            className="absolute top-0 z-20 rounded-tr-2xl"
                            style={{ left: "2rem", right: 0, padding: "0.55rem 1rem 0.55rem 0.75rem", background: "rgba(0,0,0,0.36)", backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex-1 rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.10)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${slide.totalExercises > 0 ? Math.round((slide.completedExercises / slide.totalExercises) * 100) : 0}%`,
                                            background: slide.completedExercises > 0
                                                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                                : "transparent",
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-sans font-medium text-white/60 shrink-0 tabular-nums">
                                    {slide.completedExercises}/{slide.totalExercises}
                                </span>
                            </div>
                        </div>

                        {/* Spine: nivel + difficultyLabel + estrellas vertical */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-8 z-20 flex flex-col items-center justify-center gap-2"
                            style={{
                                background: "rgba(0,0,0,0.52)",
                                backdropFilter: "blur(4px)",
                                borderRight: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <span
                                className="text-white/50 font-bold font-sans text-md md:text-xl uppercase tracking-widest"
                                style={{ writingMode: "vertical-rl" }}
                            >
                                {slide.difficultyLabel}
                            </span>
                            <div className="w-px h-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                            <div className="flex flex-col items-center gap-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="text-md md:text-xl leading-none select-none"
                                        style={{
                                            color: i < slide.difficultyLevel ? "#FFD700" : "rgba(255,255,255,0.15)",
                                            textShadow: i < slide.difficultyLevel ? "0 0 6px rgba(255,220,0,0.9)" : "none",
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Título + Comenzar + etiquetas del mundo */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4" style={{ paddingLeft: "2.5rem" }}>
                            <h2
                                className="text-3xl md:text-5xl font-semibold text-center text-white drop-shadow-md -mt-4 leading-none"
                                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
                            >
                                {slide.displayName}
                            </h2>
                            <Link
                                href={`/ejercicios/mundos/${slide.id}`}
                                className="flex items-center gap-2 px-5 py-2.5 font-sans font-semibold text-sm rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-lg"
                                style={{
                                    background: "#C73341",
                                    color: "#fff",
                                    boxShadow: "0 2px 18px rgba(199,51,65,0.45), 0 1px 4px rgba(0,0,0,0.2)",
                                    border: "1.5px solid rgba(255,255,255,0.18)",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Comenzar aventura
                            </Link>
                            {slide.therapeuticDescription && (
                                <span
                                    className="text-xs md:text-sm font-sans font-medium px-2.5 py-0.5 rounded-full"
                                    style={{
                                        background: "rgba(0,0,0,0.30)",
                                        color: "rgba(255,255,255,0.60)",
                                        backdropFilter: "blur(4px)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                >
                                    {slide.therapeuticDescription}
                                </span>
                            )}
                        </div>

                        {/* Ejercicios — abajo izquierda */}
                        <div className="absolute bottom-4 z-20" style={{ left: "2.75rem" }}>
                            <span
                                className="text-xs md:text-sm font-sans tracking-wide px-2 py-1 rounded-full"
                                style={{
                                    background: "rgba(0,0,0,0.32)",
                                    color: "rgba(255,255,255,0.65)",
                                    backdropFilter: "blur(4px)",
                                }}
                            >
                                {slide.totalExercises} ejercicios
                            </span>
                        </div>

                        {/* Leer historia — abajo derecha */}
                        <div className="absolute bottom-4 right-4 z-50">
                            <button
                                className="flex items-center gap-1.5 text-[11px] font-sans font-semibold px-3 py-2.5 md:py-2 rounded-full transition-all duration-200 hover:scale-[1.04] active:scale-95"
                                style={{
                                    background: "rgba(0,0,0,0.35)",
                                    color: "rgba(255,255,255,0.85)",
                                    backdropFilter: "blur(4px)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowLore(true);
                                }}
                            >
                                <BookOpen className="w-3 h-3" />
                                Leer historia
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        </div>
    );
};

/* ─── Carousel controls ─────────────────────────────────────── */
interface CarouselControlProps {
    type: "previous" | "next";
    title: string;
    handleClick: () => void;
}

const CarouselControl = ({ type, title, handleClick }: CarouselControlProps) => (
    <button
        className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all duration-200 hover:opacity-80 active:scale-95 focus:outline-none text-white shadow-sm"
        style={{ background: "#579F93" }}
        title={title}
        onClick={handleClick}
        aria-label={title}
    >
        {type === "previous" ? (
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        ) : (
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        )}
    </button>
);

/* ─── Carousel ──────────────────────────────────────────────── */
interface CarouselProps {
    slides: WorldData[];
    title?: string;
    description?: string;
}

export default function Carousel({ slides, title, description }: CarouselProps) {
    const [current, setCurrent] = useState(0);
    const id = useId();
    const touchStartX = useRef<number>(0);

    const handlePreviousClick = () =>
        setCurrent((prev) => (prev - 1 < 0 ? slides.length - 1 : prev - 1));
    const handleNextClick = () =>
        setCurrent((prev) => (prev + 1 === slides.length ? 0 : prev + 1));
    const handleSlideClick = (index: number) => {
        if (current !== index) setCurrent(index);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) < 40) return;
        if (diff > 0) handleNextClick();
        else handlePreviousClick();
    };

    return (
        <div
            className="flex flex-col items-center gap-3 mx-auto w-full"
            aria-labelledby={`carousel-heading-${id}`}
        >
            {(title || description) && (
                <div className="w-full px-4 md:px-10 pb-1">
                    {/* Mobile */}
                    <div className="md:hidden flex flex-col items-center gap-2">
                        {title && (
                            <h1
                                id={`carousel-heading-${id}`}
                                className="w-full text-center text-3xl font-semibold tracking-tight whitespace-nowrap [font-family:var(--font-fredoka)] text-[#2E85C8] dark:text-[#D3A021]"
                            >
                                {title}
                            </h1>
                        )}
                        <div className="flex items-center justify-between w-full px-2">
                            <CarouselControl
                                type="previous"
                                title="Mundo anterior"
                                handleClick={handlePreviousClick}
                            />
                            <CarouselControl
                                type="next"
                                title="Mundo siguiente"
                                handleClick={handleNextClick}
                            />
                        </div>
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:flex items-end gap-4">
                        <CarouselControl
                            type="previous"
                            title="Mundo anterior"
                            handleClick={handlePreviousClick}
                        />
                        <div className="flex-1 text-center">
                            {title && (
                                <h1
                                    id={`carousel-heading-${id}`}
                                    className="text-5xl font-semibold tracking-tight mb-2 [font-family:var(--font-fredoka)] text-[#2E85C8] dark:text-[#D3A021]"
                                >
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                        <CarouselControl
                            type="next"
                            title="Mundo siguiente"
                            handleClick={handleNextClick}
                        />
                    </div>
                </div>
            )}

            <div
                className="relative w-[70vmin] h-[70vmin] max-[600px]:w-[80vw] max-[600px]:h-[108vw] overflow-visible"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <ul
                    className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
                    style={{
                        transform: `translateX(-${current * (100 / slides.length)}%)`,
                    }}
                >
                    {slides.map((slide, index) => (
                        <Slide
                            key={slide.id}
                            slide={slide}
                            index={index}
                            current={current}
                            handleSlideClick={handleSlideClick}
                        />
                    ))}
                </ul>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                            width: i === current ? "1.75rem" : "0.375rem",
                            background:
                                i === current
                                    ? "oklch(0.52 0.1 200)"
                                    : "oklch(0.52 0.1 200 / 0.3)",
                        }}
                        aria-label={`Ir al mundo ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
