"use client"

import {
  Star,
  Sparkles,
  BookOpen,
  Puzzle,
  Trophy,
  Zap,
  Heart,
  Flame,
  Crown,
  Gem,
  Music,
  Gamepad2,
  Brain,
  Lightbulb,
  Target,
  Medal,
} from "lucide-react"

function FloatingLetter({ letter, className }: { letter: string; className: string }) {
  return (
    <div className={`absolute font-heading font-extrabold select-none pointer-events-none ${className}`}>
      {letter}
    </div>
  )
}

function FloatingIcon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={`absolute select-none pointer-events-none ${className}`}>
      {children}
    </div>
  )
}

function FloatingShape({ className }: { className: string }) {
  return <div className={`absolute rounded-full select-none pointer-events-none ${className}`} />
}

function FloatingStar({ className, size = "md" }: { className: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "h-3 w-3", md: "h-5 w-5", lg: "h-8 w-8" }
  return (
    <div className={`absolute select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 24 24" className={`${sizeMap[size]}`} fill="currentColor">
        <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z" />
      </svg>
    </div>
  )
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large floating letters with strong colors */}
      <FloatingLetter
        letter="A"
        className="top-[6%] left-[6%] text-6xl md:text-8xl text-primary/30 animate-float-slow"
      />
      <FloatingLetter
        letter="B"
        className="top-[12%] right-[10%] text-5xl md:text-7xl text-secondary/35 animate-float"
      />
      <FloatingLetter
        letter="C"
        className="bottom-[22%] left-[4%] text-5xl md:text-6xl text-[hsl(45,100%,55%)]/40 animate-wiggle"
      />
      <FloatingLetter
        letter="D"
        className="bottom-[12%] right-[6%] text-6xl md:text-7xl text-primary/25 animate-float-slow"
      />
      <FloatingLetter
        letter="Z"
        className="top-[38%] left-[2%] text-4xl md:text-5xl text-secondary/25 animate-bounce-soft"
      />
      <FloatingLetter
        letter="M"
        className="top-[28%] right-[3%] text-4xl md:text-6xl text-[hsl(160,85%,45%)]/30 animate-float"
      />
      <FloatingLetter
        letter="X"
        className="bottom-[35%] right-[15%] text-3xl md:text-4xl text-primary/20 animate-wiggle hidden md:block"
      />
      <FloatingLetter
        letter="L"
        className="top-[55%] left-[8%] text-3xl md:text-5xl text-secondary/20 animate-float-slow hidden md:block"
      />

      {/* Row 1 - Top icons */}
      <FloatingIcon className="top-[3%] left-[28%] animate-sparkle">
        <Star className="h-6 w-6 md:h-8 md:w-8 text-[hsl(45,100%,55%)] fill-[hsl(45,100%,55%)]/60" />
      </FloatingIcon>
      <FloatingIcon className="top-[8%] right-[28%] animate-float">
        <Crown className="h-5 w-5 md:h-7 md:w-7 text-[hsl(45,100%,55%)]/80" />
      </FloatingIcon>
      <FloatingIcon className="top-[5%] left-[55%] animate-bounce-soft">
        <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary/60" />
      </FloatingIcon>

      {/* Row 2 - Upper middle icons */}
      <FloatingIcon className="top-[18%] left-[18%] animate-float">
        <Gem className="h-5 w-5 md:h-7 md:w-7 text-primary/50" />
      </FloatingIcon>
      <FloatingIcon className="top-[22%] right-[20%] animate-wiggle">
        <Gamepad2 className="h-6 w-6 md:h-8 md:w-8 text-secondary/50" />
      </FloatingIcon>
      <FloatingIcon className="top-[15%] left-[42%] animate-sparkle">
        <Zap className="h-5 w-5 md:h-6 md:w-6 text-[hsl(45,100%,55%)] fill-[hsl(45,100%,55%)]/40" />
      </FloatingIcon>

      {/* Row 3 - Middle icons */}
      <FloatingIcon className="top-[35%] left-[12%] animate-bounce-soft">
        <Brain className="h-5 w-5 md:h-7 md:w-7 text-secondary/40" />
      </FloatingIcon>
      <FloatingIcon className="top-[40%] right-[8%] animate-float-slow">
        <Lightbulb className="h-5 w-5 md:h-7 md:w-7 text-[hsl(45,100%,55%)]/70" />
      </FloatingIcon>
      <FloatingIcon className="top-[32%] right-[30%] animate-sparkle hidden md:block">
        <Music className="h-4 w-4 md:h-6 md:w-6 text-primary/40" />
      </FloatingIcon>

      {/* Row 4 - Lower middle icons */}
      <FloatingIcon className="top-[55%] right-[12%] animate-bounce-soft">
        <Puzzle className="h-6 w-6 md:h-8 md:w-8 text-[hsl(160,85%,45%)]/50" />
      </FloatingIcon>
      <FloatingIcon className="top-[60%] left-[15%] animate-float">
        <BookOpen className="h-5 w-5 md:h-7 md:w-7 text-primary/40" />
      </FloatingIcon>
      <FloatingIcon className="top-[50%] left-[35%] animate-wiggle hidden md:block">
        <Target className="h-5 w-5 md:h-6 md:w-6 text-secondary/35" />
      </FloatingIcon>

      {/* Row 5 - Bottom icons */}
      <FloatingIcon className="bottom-[18%] left-[22%] animate-wiggle">
        <Trophy className="h-5 w-5 md:h-7 md:w-7 text-[hsl(45,100%,55%)]/70" />
      </FloatingIcon>
      <FloatingIcon className="bottom-[25%] right-[25%] animate-float-slow">
        <Heart className="h-5 w-5 md:h-6 md:w-6 text-secondary/50 fill-secondary/30" />
      </FloatingIcon>
      <FloatingIcon className="bottom-[8%] left-[40%] animate-sparkle">
        <Medal className="h-5 w-5 md:h-7 md:w-7 text-[hsl(45,100%,55%)]/60" />
      </FloatingIcon>
      <FloatingIcon className="bottom-[15%] right-[8%] animate-float">
        <Flame className="h-5 w-5 md:h-7 md:w-7 text-secondary/45" />
      </FloatingIcon>

      {/* 4-pointed stars scattered around */}
      <FloatingStar className="top-[10%] left-[50%] text-[hsl(45,100%,55%)]/70 animate-sparkle" size="lg" />
      <FloatingStar className="top-[45%] left-[5%] text-primary/40 animate-sparkle" size="md" />
      <FloatingStar className="bottom-[30%] right-[5%] text-[hsl(45,100%,55%)]/50 animate-sparkle" size="sm" />
      <FloatingStar className="top-[70%] right-[35%] text-secondary/30 animate-sparkle" size="sm" />
      <FloatingStar className="top-[25%] left-[35%] text-[hsl(160,85%,45%)]/40 animate-sparkle hidden md:block" size="md" />

      {/* Colorful floating shapes / dots */}
      <FloatingShape className="top-[20%] left-[48%] h-4 w-4 bg-primary/25 animate-bounce-soft" />
      <FloatingShape className="top-[58%] left-[78%] h-3 w-3 bg-secondary/30 animate-sparkle" />
      <FloatingShape className="bottom-[38%] left-[68%] h-5 w-5 bg-[hsl(45,100%,55%)]/25 animate-float" />
      <FloatingShape className="top-[73%] left-[38%] h-3 w-3 bg-primary/30 animate-float-slow" />
      <FloatingShape className="top-[8%] left-[70%] h-4 w-4 bg-[hsl(160,85%,45%)]/25 animate-bounce-soft" />
      <FloatingShape className="bottom-[5%] right-[40%] h-3.5 w-3.5 bg-secondary/20 animate-wiggle" />
      <FloatingShape className="top-[42%] right-[45%] h-2.5 w-2.5 bg-primary/20 animate-sparkle hidden md:block" />
      <FloatingShape className="bottom-[45%] left-[30%] h-3 w-3 bg-[hsl(45,100%,55%)]/20 animate-float hidden md:block" />

      {/* Larger blurred orbs for depth */}
      <div className="absolute top-[15%] left-[60%] h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/8 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[20%] right-[60%] h-20 w-20 md:h-28 md:w-28 rounded-full bg-secondary/8 blur-3xl animate-float" />
      <div className="absolute top-[50%] left-[70%] h-16 w-16 md:h-24 md:w-24 rounded-full bg-[hsl(45,100%,55%)]/8 blur-2xl animate-bounce-soft" />
    </div>
  )
}
