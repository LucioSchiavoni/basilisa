export function WatercolorBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id="wc-f1" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="softened" />
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="4" seed="3" result="noise" />
            <feDisplacementMap in="softened" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wc-f2" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="softened" />
            <feTurbulence type="fractalNoise" baseFrequency="0.038" numOctaves="4" seed="9" result="noise" />
            <feDisplacementMap in="softened" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="wc-f3" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="softened" />
            <feTurbulence type="fractalNoise" baseFrequency="0.044" numOctaves="3" seed="17" result="noise" />
            <feDisplacementMap in="softened" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* === LADO IZQUIERDO === */}

        {/* Stain 0 — Rojo grande, esquina superior izquierda */}
        <g
          data-stain
          filter="url(#wc-f1)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="155" cy="178" rx="195" ry="158" fill="#C73341" opacity="0.06" />
          <ellipse cx="150" cy="173" rx="148" ry="118" fill="#C73341" opacity="0.04" />
          <ellipse cx="155" cy="178" rx="195" ry="158" fill="none" stroke="#C73341" strokeWidth="5" opacity="0.022" />
        </g>

        {/* Stain 1 — Verde azulado, costado izquierdo medio */}
        <g
          data-stain
          filter="url(#wc-f2)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="72" cy="515" rx="138" ry="168" fill="#579F93" opacity="0.055" />
          <ellipse cx="68" cy="510" rx="105" ry="128" fill="#579F93" opacity="0.035" />
          <ellipse cx="72" cy="515" rx="138" ry="168" fill="none" stroke="#579F93" strokeWidth="4" opacity="0.02" />
        </g>

        {/* Stain 2 — Dorado pequeño, inferior izquierdo */}
        <g
          data-stain
          filter="url(#wc-f3)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="248" cy="818" rx="110" ry="82" fill="#D3A021" opacity="0.055" />
          <ellipse cx="245" cy="815" rx="82" ry="62" fill="#D3A021" opacity="0.035" />
        </g>

        {/* Stain 3 — Salpicadura roja, izquierda */}
        <g
          data-stain
          filter="url(#wc-f3)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="328" cy="292" rx="36" ry="28" fill="#C73341" opacity="0.055" />
          <ellipse cx="326" cy="290" rx="22" ry="17" fill="#C73341" opacity="0.035" />
        </g>

        {/* === LADO DERECHO === */}

        {/* Stain 4 — Azul grande, esquina superior derecha */}
        <g
          data-stain
          filter="url(#wc-f2)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="1285" cy="215" rx="182" ry="152" fill="#2E85C8" opacity="0.06" />
          <ellipse cx="1288" cy="210" rx="138" ry="115" fill="#2E85C8" opacity="0.04" />
          <ellipse cx="1285" cy="215" rx="182" ry="152" fill="none" stroke="#2E85C8" strokeWidth="5" opacity="0.022" />
        </g>

        {/* Stain 5 — Dorado, costado derecho medio */}
        <g
          data-stain
          filter="url(#wc-f1)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="1382" cy="492" rx="128" ry="162" fill="#D3A021" opacity="0.055" />
          <ellipse cx="1378" cy="488" rx="96" ry="122" fill="#D3A021" opacity="0.035" />
          <ellipse cx="1382" cy="492" rx="128" ry="162" fill="none" stroke="#D3A021" strokeWidth="4" opacity="0.018" />
        </g>

        {/* Stain 6 — Verde azulado, inferior derecho */}
        <g
          data-stain
          filter="url(#wc-f3)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="1200" cy="792" rx="112" ry="92" fill="#579F93" opacity="0.055" />
          <ellipse cx="1198" cy="788" rx="85" ry="70" fill="#579F93" opacity="0.035" />
        </g>

        {/* Stain 7 — Salpicadura azul, derecha */}
        <g
          data-stain
          filter="url(#wc-f3)"
          style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="1108" cy="315" rx="30" ry="24" fill="#2E85C8" opacity="0.055" />
          <ellipse cx="1106" cy="313" rx="18" ry="14" fill="#2E85C8" opacity="0.035" />
        </g>
      </svg>
    </div>
  )
}
