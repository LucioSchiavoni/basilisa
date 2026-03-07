import { useState, useEffect, useRef } from "react";

interface PreviousAttempt {
    date: string;
    score: number;
    ppm: number;
}

interface QuestionDetail {
    id: number;
    correct: boolean;
    timeSeconds: number;
}

interface ResultsData {
    exerciseTitle: string;
    worldName: string;
    scorePercentage: number;
    correctAnswers: number;
    totalQuestions: number;
    readingTimeSeconds: number;
    totalTimeSeconds: number;
    wordCount: number;
    expectedPPM: number;
    gemsEarned: number;
    previousAttempts: PreviousAttempt[];
    questionDetails: QuestionDetail[];
}

const MOCK_DATA: ResultsData = {
    exerciseTitle: "El brujito encantador",
    worldName: "Medieval",
    scorePercentage: 70,
    correctAnswers: 7,
    totalQuestions: 10,
    readingTimeSeconds: 73,
    totalTimeSeconds: 107,
    wordCount: 142,
    expectedPPM: 90,
    gemsEarned: 12,
    previousAttempts: [
        { date: "28 Feb", score: 50, ppm: 78 },
        { date: "02 Mar", score: 60, ppm: 85 },
        { date: "05 Mar", score: 65, ppm: 92 },
        { date: "Hoy", score: 70, ppm: 117 },
    ],
    questionDetails: [
        { id: 1, correct: true, timeSeconds: 4.2 },
        { id: 2, correct: false, timeSeconds: 7.1 },
        { id: 3, correct: true, timeSeconds: 3.8 },
        { id: 4, correct: true, timeSeconds: 5.5 },
        { id: 5, correct: false, timeSeconds: 8.9 },
        { id: 6, correct: true, timeSeconds: 12.3 },
        { id: 7, correct: true, timeSeconds: 3.1 },
        { id: 8, correct: true, timeSeconds: 4.7 },
        { id: 9, correct: true, timeSeconds: 3.9 },
        { id: 10, correct: false, timeSeconds: 6.2 },
    ],
};

interface AnimatedNumberProps {
    value: number;
    suffix?: string;
    duration?: number;
}

function AnimatedNumber({ value, suffix = "", duration = 1200 }: AnimatedNumberProps) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<number | null>(null);

    useEffect(() => {
        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) ref.current = requestAnimationFrame(animate);
        };
        ref.current = requestAnimationFrame(animate);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [value, duration]);

    return (
        <span>
            {display}
            {suffix}
        </span>
    );
}

interface DonutChartProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

function DonutChart({ percentage, size = 140, strokeWidth = 12 }: DonutChartProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOffset(circumference - (percentage / 100) * circumference);
        }, 300);
        return () => clearTimeout(timer);
    }, [percentage, circumference]);

    const getColor = (pct: number) => {
        if (pct >= 80) return "#579F93";
        if (pct >= 60) return "#6db3a7";
        if (pct >= 40) return "#facc15";
        return "#fb923c";
    };

    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor(percentage)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: getColor(percentage),
                        fontFamily: "'Nunito', sans-serif",
                        lineHeight: 1,
                    }}
                >
                    <AnimatedNumber value={percentage} suffix="%" />
                </span>
            </div>
        </div>
    );
}

interface SpeedMeterProps {
    actualPPM: number;
    expectedPPM: number;
}

function SpeedMeter({ actualPPM, expectedPPM }: SpeedMeterProps) {
    const ratio = Math.min(actualPPM / expectedPPM, 2);
    const percentage = Math.min(ratio * 100, 100);

    const getSpeedColor = () => {
        if (ratio >= 1) return "#579F93";
        if (ratio >= 0.7) return "#facc15";
        return "#fb923c";
    };

    const getSpeedLabel = () => {
        if (ratio >= 1.2) return "¡Excelente velocidad!";
        if (ratio >= 1) return "¡Por encima del nivel esperado!";
        if (ratio >= 0.7) return "Muy cerca del objetivo";
        return "Sigue practicando la fluidez";
    };

    return (
        <div
            style={{
                background: "#faf7f2",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>
                Velocidad de lectura
            </span>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#292524", fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>
                    <AnimatedNumber value={actualPPM} />
                </span>
                <span style={{ fontSize: "0.85rem", color: "#78716c", fontFamily: "'Nunito', sans-serif" }}>
                    palabras por minuto
                </span>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <span style={{ fontSize: "0.8rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif" }}>
                        Esperado: {expectedPPM} ppm
                    </span>
                </div>
            </div>

            <div style={{ position: "relative", height: 10, background: "#e7e5e4", borderRadius: 99 }}>
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${getSpeedColor()}88, ${getSpeedColor()})`,
                        borderRadius: 99,
                        transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: `${Math.min((expectedPPM / (expectedPPM * 2)) * 100, 100)}%`,
                        top: -4,
                        width: 2,
                        height: 18,
                        background: "#78716c",
                        borderRadius: 1,
                    }}
                />
            </div>

            <span
                style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: getSpeedColor(),
                    fontFamily: "'Nunito', sans-serif",
                }}
            >
                {getSpeedLabel()}
            </span>
        </div>
    );
}

interface MiniEvolutionChartProps {
    attempts: PreviousAttempt[];
}

function MiniEvolutionChart({ attempts }: MiniEvolutionChartProps) {
    if (!attempts || attempts.length < 2) return null;

    const maxScore = 100;
    const width = 280;
    const height = 80;
    const padding = { top: 10, right: 10, bottom: 24, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = attempts.map((a, i) => ({
        x: padding.left + (i / (attempts.length - 1)) * chartW,
        y: padding.top + chartH - (a.score / maxScore) * chartH,
        ...a,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    return (
        <div
            style={{
                background: "#faf7f2",
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            <span
                style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#78716c",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "'Nunito', sans-serif",
                }}
            >
                Tu evolución
            </span>
            <svg width={width} height={height} style={{ width: "100%", maxWidth: width }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#579F93" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#579F93" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <path d={areaD} fill="url(#areaGrad)" />
                <path d={pathD} fill="none" stroke="#579F93" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? "#457f75" : "#579F93"} stroke="white" strokeWidth={2} />
                        <text x={p.x} y={height - 4} textAnchor="middle" fontSize={10} fill="#a8a29e" fontFamily="'Nunito', sans-serif">
                            {p.date}
                        </text>
                    </g>
                ))}
            </svg>
            {attempts.length >= 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "0.8rem", color: "#579F93", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                        +{attempts[attempts.length - 1].score - attempts[attempts.length - 2].score}%
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif" }}>
                        vs última vez
                    </span>
                </div>
            )}
        </div>
    );
}

interface QuestionTimelineProps {
    questions: QuestionDetail[];
    maxTimeSeconds?: number;
}

function QuestionTimeline({ questions, maxTimeSeconds = 30 }: QuestionTimelineProps) {
    const maxT = Math.max(...questions.map((q) => q.timeSeconds), maxTimeSeconds);
    return (
        <div
            style={{
                background: "#faf7f2",
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                    style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#78716c",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontFamily: "'Nunito', sans-serif",
                    }}
                >
                    Detalle por pregunta
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#292524", fontFamily: "'Nunito', sans-serif" }}>
                    {questions.filter((q) => q.correct).length}/{questions.length}
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {questions.map((q) => (
                    <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                            style={{
                                width: 20,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#a8a29e",
                                textAlign: "right",
                                fontFamily: "'Nunito', sans-serif",
                            }}
                        >
                            {q.id}
                        </span>
                        <div style={{ flex: 1, height: 20, background: "#e7e5e4", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                            <div
                                style={{
                                    height: "100%",
                                    width: `${(q.timeSeconds / maxT) * 100}%`,
                                    background: q.correct
                                        ? "linear-gradient(90deg, #7ab8ae, #579F93)"
                                        : "linear-gradient(90deg, #fca5a5, #f87171)",
                                    borderRadius: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    paddingRight: 6,
                                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "white", fontFamily: "'Nunito', sans-serif" }}>
                                    {q.timeSeconds.toFixed(1)}s
                                </span>
                            </div>
                        </div>
                        <span style={{ fontSize: "0.85rem", width: 20, textAlign: "center" }}>
                            {q.correct ? "✓" : "✗"}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid #e7e5e4" }}>
                <span style={{ fontSize: "0.75rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif" }}>
                    Promedio: {(questions.reduce((s, q) => s + q.timeSeconds, 0) / questions.length).toFixed(1)}s por pregunta
                </span>
                <span style={{ fontSize: "0.75rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif" }}>
                    Más lenta: P{questions.reduce((max, q) => (q.timeSeconds > max.timeSeconds ? q : max)).id}
                </span>
            </div>
        </div>
    );
}

interface GemsBadgeProps {
    gems: number;
}

function GemsBadge({ gems }: GemsBadgeProps) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                    borderRadius: 12,
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #fcd34d44",
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        background: "linear-gradient(135deg, #7dd3fc, #38bdf8)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "white",
                        fontWeight: 700,
                        fontFamily: "'Nunito', sans-serif",
                    }}
                    title="Aquí va la animación Lottie de gemas"
                >
                    GEM
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#92400e", fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>
                        +<AnimatedNumber value={gems} />
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "#b45309", fontFamily: "'Nunito', sans-serif" }}>gemas</span>
                </div>
            </div>
        </div>
    );
}

interface TimeCardProps {
    readingTimeSeconds: number;
    totalTimeSeconds: number;
    wordCount: number;
}

function TimeCard({ readingTimeSeconds, totalTimeSeconds, wordCount }: TimeCardProps) {
    const fmt = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div
            style={{
                background: "#faf7f2",
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-around",
                gap: 16,
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "0.7rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Lectura
                </span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#292524", fontFamily: "'Nunito', sans-serif" }}>
                    {fmt(readingTimeSeconds)}
                </span>
            </div>
            <div style={{ width: 1, background: "#e7e5e4" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "0.7rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Total
                </span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#292524", fontFamily: "'Nunito', sans-serif" }}>
                    {fmt(totalTimeSeconds)}
                </span>
            </div>
            <div style={{ width: 1, background: "#e7e5e4" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: "0.7rem", color: "#a8a29e", fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Palabras
                </span>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#292524", fontFamily: "'Nunito', sans-serif" }}>
                    {wordCount}
                </span>
            </div>
        </div>
    );
}

function getMotivationalMessage(score: number) {
    if (score === 100) return { emoji: "🏆", title: "¡Perfecto!", subtitle: "¡Dominaste este ejercicio!" };
    if (score >= 80) return { emoji: "🌟", title: "¡Muy bien!", subtitle: "Estás avanzando genial" };
    if (score >= 60) return { emoji: "💪", title: "¡Buen trabajo!", subtitle: "Sigue practicando" };
    if (score >= 40) return { emoji: "🌱", title: "¡Vas por buen camino!", subtitle: "Cada intento te hace mejor" };
    return { emoji: "🫶", title: "¡No te rindas!", subtitle: "La práctica hace la diferencia" };
}

export default function ResultadosReadingComprehension() {
    const d = MOCK_DATA;
    const actualPPM = Math.round((d.wordCount / d.readingTimeSeconds) * 60);
    const msg = getMotivationalMessage(d.scorePercentage);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    const sectionStyle = (delay: number) => ({
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    });

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #fefcf8 0%, #f5f0e8 100%)",
                display: "flex",
                justifyContent: "center",
                padding: "24px 16px 100px",
                fontFamily: "'Nunito', system-ui, sans-serif",
            }}
        >
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

            <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}>

                <div style={{ textAlign: "center", ...sectionStyle(0) }}>
                    <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: 4 }}>{msg.emoji}</div>
                    <h1
                        style={{
                            fontSize: "1.7rem",
                            fontWeight: 900,
                            color: "#1c1917",
                            margin: "4px 0 0",
                            fontFamily: "'Nunito', sans-serif",
                        }}
                    >
                        {msg.title}
                    </h1>
                    <p style={{ fontSize: "1rem", color: "#78716c", margin: "2px 0 0", fontFamily: "'Nunito', sans-serif" }}>
                        {msg.subtitle}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#a8a29e", margin: "4px 0 0", fontFamily: "'Nunito', sans-serif" }}>
                        {d.exerciseTitle}
                    </p>
                </div>

                <div style={{ display: "flex", gap: 12, ...sectionStyle(150) }}>
                    <div
                        style={{
                            flex: 1,
                            background: "#faf7f2",
                            borderRadius: 16,
                            padding: "20px 16px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <DonutChart percentage={d.scorePercentage} size={120} strokeWidth={10} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#78716c", fontFamily: "'Nunito', sans-serif" }}>
                            Aciertos
                        </span>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                        <GemsBadge gems={d.gemsEarned} />
                        <TimeCard
                            readingTimeSeconds={d.readingTimeSeconds}
                            totalTimeSeconds={d.totalTimeSeconds}
                            wordCount={d.wordCount}
                        />
                    </div>
                </div>

                <div style={sectionStyle(300)}>
                    <SpeedMeter actualPPM={actualPPM} expectedPPM={d.expectedPPM} />
                </div>

                <div style={sectionStyle(450)}>
                    <MiniEvolutionChart attempts={d.previousAttempts} />
                </div>

                <div style={sectionStyle(600)}>
                    <QuestionTimeline questions={d.questionDetails} />
                </div>

                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "linear-gradient(transparent, #f5f0e8 30%)" }}>
                    <button
                        style={{
                            width: "100%",
                            maxWidth: 420,
                            margin: "0 auto",
                            display: "block",
                            padding: "16px 32px",
                            background: "#1c1917",
                            color: "white",
                            border: "none",
                            borderRadius: 14,
                            fontSize: "1rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif",
                            transition: "transform 0.15s ease, box-shadow 0.15s ease",
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            (e.target as HTMLButtonElement).style.transform = "scale(1.02)";
                            (e.target as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            (e.target as HTMLButtonElement).style.transform = "scale(1)";
                            (e.target as HTMLButtonElement).style.boxShadow = "none";
                        }}
                    >
                        Volver a ejercicios
                    </button>
                </div>
            </div>
        </div>
    );
}