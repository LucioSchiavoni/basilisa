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
          <filter id="ac-f1" x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ac-f2" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.065" numOctaves="3" seed="13" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ac-f3" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="19" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* ── LADO IZQUIERDO ── */}

        {/* Stain 0 — Rojo grande, borde superior izquierdo, muy recortado */}
        <g data-stain filter="url(#ac-f1)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M -140,30 C -80,-30 60,-20 140,30 C 220,80 258,165 240,235 C 222,305 158,345 80,340 C 2,335 -70,290 -110,230 C -150,170 -200,90 -140,30 Z" fill="#C73341" opacity="0.50" />
          <path d="M -110,55 C -58,10 65,2 138,52 C 210,98 238,172 222,234 C 206,296 148,328 78,324 C 8,320 -58,280 -92,224 C -126,168 -162,100 -110,55 Z" fill="#C73341" opacity="0.22" />
          <path d="M 232,215 C 285,210 338,218 365,230 C 348,248 308,242 258,232 Z" fill="#C73341" opacity="0.40" />
          <circle cx="298" cy="262" r="22" fill="#C73341" opacity="0.38" />
          <circle cx="348" cy="162" r="16" fill="#C73341" opacity="0.34" />
          <circle cx="195" cy="365" r="17" fill="#C73341" opacity="0.32" />
          <circle cx="375" cy="305" r="10" fill="#C73341" opacity="0.28" />
          <circle cx="380" cy="215" r="7" fill="#C73341" opacity="0.30" />
          <circle cx="400" cy="252" r="5" fill="#C73341" opacity="0.26" />
          <circle cx="278" cy="392" r="7" fill="#C73341" opacity="0.26" />
          <circle cx="418" cy="275" r="4" fill="#C73341" opacity="0.22" />
          <circle cx="410" cy="225" r="3" fill="#C73341" opacity="0.20" />
          <circle cx="432" cy="258" r="2.5" fill="#C73341" opacity="0.18" />
          <circle cx="295" cy="415" r="3" fill="#C73341" opacity="0.18" />
        </g>

        {/* Stain 1 — Teal, borde izquierdo medio, muy recortado */}
        <g data-stain filter="url(#ac-f2)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M -180,390 C -130,340 -40,328 40,358 C 120,388 162,455 158,528 C 154,600 108,648 38,652 C -32,656 -115,622 -155,568 C -195,514 -230,440 -180,390 Z" fill="#579F93" opacity="0.50" />
          <path d="M -155,412 C -112,368 -30,358 42,384 C 114,410 148,472 145,538 C 142,604 100,642 36,646 C -28,650 -105,618 -140,568 C -175,518 -198,456 -155,412 Z" fill="#579F93" opacity="0.20" />
          <path d="M 150,508 C 205,512 260,522 285,535 C 268,552 225,546 175,536 Z" fill="#579F93" opacity="0.40" />
          <circle cx="228" cy="482" r="22" fill="#579F93" opacity="0.38" />
          <circle cx="282" cy="556" r="16" fill="#579F93" opacity="0.32" />
          <circle cx="188" cy="614" r="14" fill="#579F93" opacity="0.32" />
          <circle cx="108" cy="668" r="10" fill="#579F93" opacity="0.28" />
          <circle cx="258" cy="422" r="13" fill="#579F93" opacity="0.30" />
          <circle cx="318" cy="502" r="7" fill="#579F93" opacity="0.28" />
          <circle cx="332" cy="568" r="5" fill="#579F93" opacity="0.24" />
          <circle cx="205" cy="648" r="6" fill="#579F93" opacity="0.26" />
          <circle cx="78" cy="685" r="5" fill="#579F93" opacity="0.22" />
          <circle cx="305" cy="605" r="4" fill="#579F93" opacity="0.22" />
          <circle cx="348" cy="542" r="3" fill="#579F93" opacity="0.20" />
          <circle cx="222" cy="668" r="2.5" fill="#579F93" opacity="0.18" />
        </g>

        {/* Stain 2 — Dorado, borde inferior izquierdo, recortado */}
        <g data-stain filter="url(#ac-f3)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M -60,728 C -8,692 88,695 152,728 C 216,762 245,822 222,875 C 199,925 128,938 58,918 C -12,898 -62,858 -68,808 C -74,758 -112,764 -60,728 Z" fill="#D3A021" opacity="0.50" />
          <path d="M 225,838 C 272,840 322,850 342,862 C 326,876 288,870 244,858 Z" fill="#D3A021" opacity="0.40" />
          <circle cx="280" cy="792" r="19" fill="#D3A021" opacity="0.38" />
          <circle cx="332" cy="852" r="13" fill="#D3A021" opacity="0.32" />
          <circle cx="355" cy="790" r="10" fill="#D3A021" opacity="0.28" />
          <circle cx="258" cy="892" r="11" fill="#D3A021" opacity="0.28" />
          <circle cx="375" cy="828" r="7" fill="#D3A021" opacity="0.28" />
          <circle cx="392" cy="865" r="5" fill="#D3A021" opacity="0.24" />
          <circle cx="292" cy="918" r="6" fill="#D3A021" opacity="0.22" />
          <circle cx="408" cy="845" r="3" fill="#D3A021" opacity="0.20" />
          <circle cx="312" cy="930" r="2.5" fill="#D3A021" opacity="0.18" />
        </g>

        {/* Stain 3 — Salpicadura roja, izquierda centro */}
        <g data-stain filter="url(#ac-f3)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M 48,248 C 82,224 132,228 162,255 C 192,282 188,328 160,348 C 132,368 88,365 60,342 C 32,318 14,272 48,248 Z" fill="#C73341" opacity="0.40" />
          <circle cx="195" cy="270" r="16" fill="#C73341" opacity="0.36" />
          <circle cx="222" cy="308" r="10" fill="#C73341" opacity="0.30" />
          <circle cx="28" cy="238" r="11" fill="#C73341" opacity="0.30" />
          <circle cx="238" cy="265" r="7" fill="#C73341" opacity="0.26" />
          <circle cx="168" cy="372" r="8" fill="#C73341" opacity="0.24" />
          <circle cx="12" cy="222" r="5" fill="#C73341" opacity="0.24" />
          <circle cx="252" cy="292" r="4" fill="#C73341" opacity="0.22" />
          <circle cx="262" cy="328" r="3" fill="#C73341" opacity="0.20" />
          <circle cx="185" cy="392" r="3" fill="#C73341" opacity="0.18" />
        </g>

        {/* ── LADO DERECHO ── */}

        {/* Stain 4 — Azul grande, borde superior derecho, muy recortado */}
        <g data-stain filter="url(#ac-f1)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M 1300,30 C 1362,-28 1500,-18 1582,32 C 1664,82 1698,165 1678,238 C 1658,310 1582,348 1500,342 C 1418,336 1348,290 1308,230 C 1268,170 1238,88 1300,30 Z" fill="#2E85C8" opacity="0.50" />
          <path d="M 1322,55 C 1378,8 1505,0 1580,52 C 1652,102 1680,178 1662,238 C 1644,298 1574,330 1498,326 C 1422,322 1358,280 1320,224 C 1282,168 1266,102 1322,55 Z" fill="#2E85C8" opacity="0.22" />
          <path d="M 1205,215 C 1155,210 1102,218 1075,230 C 1092,248 1132,242 1182,232 Z" fill="#2E85C8" opacity="0.40" />
          <circle cx="1142" cy="262" r="22" fill="#2E85C8" opacity="0.38" />
          <circle cx="1092" cy="162" r="16" fill="#2E85C8" opacity="0.34" />
          <circle cx="1245" cy="365" r="17" fill="#2E85C8" opacity="0.32" />
          <circle cx="1065" cy="305" r="10" fill="#2E85C8" opacity="0.28" />
          <circle cx="1060" cy="215" r="7" fill="#2E85C8" opacity="0.30" />
          <circle cx="1040" cy="252" r="5" fill="#2E85C8" opacity="0.26" />
          <circle cx="1162" cy="392" r="7" fill="#2E85C8" opacity="0.26" />
          <circle cx="1022" cy="275" r="4" fill="#2E85C8" opacity="0.22" />
          <circle cx="1030" cy="225" r="3" fill="#2E85C8" opacity="0.20" />
          <circle cx="1008" cy="258" r="2.5" fill="#2E85C8" opacity="0.18" />
          <circle cx="1145" cy="415" r="3" fill="#2E85C8" opacity="0.18" />
        </g>

        {/* Stain 5 — Dorado, borde derecho medio, muy recortado */}
        <g data-stain filter="url(#ac-f2)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M 1400,388 C 1452,340 1560,328 1640,358 C 1720,390 1762,458 1758,530 C 1754,602 1702,650 1622,652 C 1542,654 1458,620 1418,565 C 1378,510 1370,436 1400,388 Z" fill="#D3A021" opacity="0.50" />
          <path d="M 1420,412 C 1468,370 1568,360 1642,386 C 1714,412 1748,474 1745,540 C 1742,606 1694,642 1622,646 C 1550,650 1472,616 1436,562 C 1400,508 1372,454 1420,412 Z" fill="#D3A021" opacity="0.20" />
          <path d="M 1290,508 C 1235,512 1180,522 1155,535 C 1172,552 1215,546 1265,536 Z" fill="#D3A021" opacity="0.40" />
          <circle cx="1212" cy="482" r="22" fill="#D3A021" opacity="0.38" />
          <circle cx="1158" cy="556" r="16" fill="#D3A021" opacity="0.32" />
          <circle cx="1252" cy="614" r="14" fill="#D3A021" opacity="0.32" />
          <circle cx="1332" cy="668" r="10" fill="#D3A021" opacity="0.28" />
          <circle cx="1182" cy="422" r="13" fill="#D3A021" opacity="0.30" />
          <circle cx="1122" cy="502" r="7" fill="#D3A021" opacity="0.28" />
          <circle cx="1108" cy="568" r="5" fill="#D3A021" opacity="0.24" />
          <circle cx="1235" cy="648" r="6" fill="#D3A021" opacity="0.26" />
          <circle cx="1362" cy="685" r="5" fill="#D3A021" opacity="0.22" />
          <circle cx="1095" cy="478" r="4" fill="#D3A021" opacity="0.22" />
          <circle cx="1082" cy="542" r="3" fill="#D3A021" opacity="0.20" />
          <circle cx="1252" cy="668" r="2.5" fill="#D3A021" opacity="0.18" />
        </g>

        {/* Stain 6 — Teal, borde inferior derecho, recortado */}
        <g data-stain filter="url(#ac-f3)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M 1290,728 C 1345,692 1452,695 1518,730 C 1584,765 1614,828 1590,882 C 1566,932 1488,944 1408,922 C 1328,900 1272,855 1268,802 C 1264,750 1235,764 1290,728 Z" fill="#579F93" opacity="0.50" />
          <path d="M 1148,798 C 1098,804 1050,814 1028,826 C 1044,840 1082,834 1128,822 Z" fill="#579F93" opacity="0.40" />
          <circle cx="1192" cy="780" r="19" fill="#579F93" opacity="0.38" />
          <circle cx="1142" cy="848" r="14" fill="#579F93" opacity="0.32" />
          <circle cx="1165" cy="792" r="10" fill="#579F93" opacity="0.28" />
          <circle cx="1118" cy="892" r="11" fill="#579F93" opacity="0.28" />
          <circle cx="1108" cy="828" r="7" fill="#579F93" opacity="0.28" />
          <circle cx="1092" cy="868" r="5" fill="#579F93" opacity="0.24" />
          <circle cx="1155" cy="918" r="6" fill="#579F93" opacity="0.22" />
          <circle cx="1075" cy="845" r="3" fill="#579F93" opacity="0.20" />
          <circle cx="1172" cy="932" r="2.5" fill="#579F93" opacity="0.18" />
        </g>

        {/* Stain 7 — Salpicadura azul, derecha centro */}
        <g data-stain filter="url(#ac-f3)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
          <path d="M 1278,252 C 1312,228 1362,232 1390,258 C 1418,284 1414,328 1386,348 C 1358,368 1312,365 1282,342 C 1252,318 1244,276 1278,252 Z" fill="#2E85C8" opacity="0.40" />
          <circle cx="1248" cy="272" r="16" fill="#2E85C8" opacity="0.36" />
          <circle cx="1222" cy="312" r="10" fill="#2E85C8" opacity="0.30" />
          <circle cx="1412" cy="238" r="11" fill="#2E85C8" opacity="0.30" />
          <circle cx="1205" cy="268" r="7" fill="#2E85C8" opacity="0.26" />
          <circle cx="1272" cy="375" r="8" fill="#2E85C8" opacity="0.24" />
          <circle cx="1428" cy="222" r="5" fill="#2E85C8" opacity="0.24" />
          <circle cx="1188" cy="295" r="4" fill="#2E85C8" opacity="0.22" />
          <circle cx="1178" cy="330" r="3" fill="#2E85C8" opacity="0.20" />
          <circle cx="1288" cy="395" r="3" fill="#2E85C8" opacity="0.18" />
        </g>
      </svg>
    </div>
  )
}
