/**
 * Set de iconos SVG.
 *
 * Los emojis no valen como iconografía de interfaz: cambian de dibujo en cada
 * sistema operativo, no heredan el color del texto y no se pueden escalar con
 * los tokens de tamaño. Todos estos comparten rejilla de 24, trazo de 1.75 y
 * `currentColor`, así que se tiñen solos según el contexto donde se pongan.
 */

const base = {
  width: 24, height: 24, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true, focusable: false,
}

function Svg({ children, tam = 24, relleno = false, ...props }) {
  return (
    <svg {...base} width={tam} height={tam} {...(relleno ? { fill: 'currentColor', stroke: 'none' } : {})} {...props}>
      {children}
    </svg>
  )
}

export const Llama = (p) => (
  <Svg {...p}>
    <path d="M12 3c.5 2.5-1 3.5-2 4.8-1.2 1.5-2 2.9-2 4.7a6 6 0 0 0 12 0c0-2.4-1.2-4.3-2.6-5.7C15.8 5.1 14.5 4 14 2c-.7 1-1.4 1.6-2 1z" />
    <path d="M12 18a2.5 2.5 0 0 1-1.4-4.6c.5-.4.9-1 1-1.7.7.6 1.5 1.4 2 2.3.3.6.4 1.1.4 1.5A2.5 2.5 0 0 1 12 18z" opacity=".55" />
  </Svg>
)

export const Gema = (p) => (
  <Svg {...p}>
    <path d="M6 3h12l3 6-9 12L3 9z" />
    <path d="M3 9h18M9 3 6 9l6 12M15 3l3 6-6 12" opacity=".5" />
  </Svg>
)

export const Corazon = ({ relleno, ...p }) => (
  <Svg {...p} fill={relleno ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8.4a3.8 3.8 0 0 1 7 2.4C19 15.6 12 20 12 20z" />
  </Svg>
)

export const Altavoz = ({ ondas = 2, ...p }) => (
  <Svg {...p}>
    <path d="M11 5 6.5 9H3v6h3.5L11 19z" />
    {ondas >= 1 && <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />}
    {ondas >= 2 && <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" opacity=".55" />}
  </Svg>
)

export const Check = (p) => <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>
export const Cruz = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
export const Atras = (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
export const Abajo = (p) => <Svg {...p}><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></Svg>

export const Corona = (p) => (
  <Svg {...p} relleno>
    <path d="M3 8.5 6.5 12 12 5l5.5 7L21 8.5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
  </Svg>
)

export const Estrella = ({ relleno = true, ...p }) => (
  <Svg {...p} fill={relleno ? 'currentColor' : 'none'}>
    <path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 17.3l-5.3 2.9 1.1-6.1L3.4 9.9l6-.8z" />
  </Svg>
)

export const Candado = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </Svg>
)

export const Repetir = (p) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 0 0-14-4.5L4 9" />
    <path d="M4 5v4h4" />
    <path d="M4 13a8 8 0 0 0 14 4.5L20 15" />
    <path d="M20 19v-4h-4" />
  </Svg>
)

export const Diana = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" opacity=".6" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
)

export const Trofeo = (p) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5.5H4.5V7a3.5 3.5 0 0 0 3 3.4M17 5.5h2.5V7a3.5 3.5 0 0 1-3 3.4" opacity=".6" />
    <path d="M12 14v3.5M8.5 20.5h7M9.5 20.5c0-1.7 1.1-3 2.5-3s2.5 1.3 2.5 3" />
  </Svg>
)

export const Bombilla = (p) => (
  <Svg {...p}>
    <path d="M9.2 16.5a6 6 0 1 1 5.6 0v1.7a1.3 1.3 0 0 1-1.3 1.3h-3a1.3 1.3 0 0 1-1.3-1.3z" />
    <path d="M10 21.5h4" opacity=".6" />
  </Svg>
)

export const Rayo = (p) => (
  <Svg {...p} relleno><path d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5z" /></Svg>
)

export const Perfil = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Svg>
)

export const Casa = (p) => (
  <Svg {...p}>
    <path d="m3.5 10.5 8.5-7 8.5 7" />
    <path d="M5.5 9v10.5a1 1 0 0 0 1 1H10V15a2 2 0 0 1 4 0v5.5h3.5a1 1 0 0 0 1-1V9" />
  </Svg>
)

export const Libro = (p) => (
  <Svg {...p}>
    <path d="M12 6.5C10.5 5 8.5 4.5 6 4.5c-1 0-2 .15-2.5.3v13.7c.5-.15 1.5-.3 2.5-.3 2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2 1 0 2 .15 2.5.3V4.8c-.5-.15-1.5-.3-2.5-.3-2.5 0-4.5.5-6 2z" />
    <path d="M12 6.5v13.7" opacity=".5" />
  </Svg>
)

export const Adelante = (p) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>

export const Lista = (p) => (
  <Svg {...p}>
    <path d="M9 6.5h11M9 12h11M9 17.5h11" />
    <path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" strokeWidth="2.5" />
  </Svg>
)

export const Grafico = (p) => (
  <Svg {...p}>
    <path d="M4 20V4" opacity=".5" /><path d="M4 20h16" opacity=".5" />
    <path d="M7.5 16.5V12M12 16.5V7.5M16.5 16.5v-6" />
  </Svg>
)

/* ── Iconos de unidad ────────────────────────────────────────────────────── */

const Letras = (p) => (
  <Svg {...p}><path d="M3 17 6.5 7 10 17M4 14h5" /><path d="M14 17V7h2.8a2.5 2.5 0 0 1 0 5H14m0 0h3.2a2.5 2.5 0 0 1 0 5H14" /></Svg>
)
const Play = (p) => <Svg {...p} relleno><path d="M8 5.5v13l10-6.5z" /></Svg>
const Reloj = (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
const FlechaAtras = (p) => <Svg {...p}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></Svg>
const FlechaAdelante = (p) => <Svg {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></Svg>
const Cruzado = (p) => <Svg {...p}><path d="M4 9h12l-3-3M20 15H8l3 3" /></Svg>
const Capas = (p) => <Svg {...p}><path d="m12 3 8.5 4.5L12 12 3.5 7.5z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5" opacity=".55" /></Svg>

/**
 * Los glifos de `unidades.json` (●, ◐, ⇄…) eran texto, no iconos: se veían
 * distinto en cada dispositivo. Aquí se traducen a iconos reales sin tocar el
 * contenido, para que el profesor pueda seguir editando el JSON como siempre.
 */
const POR_GLIFO = {
  S: Letras, '◐': Play, '◀': FlechaAtras, '●': Reloj, '▶': FlechaAdelante,
  '▷': FlechaAdelante, '◁': Play, '◆': Capas, '◇': Capas, '◈': Capas,
  '⇄': Cruzado, '🔊': Altavoz, '★': Estrella,
}

export function IconoUnidad({ glifo, ...props }) {
  const Componente = POR_GLIFO[glifo] || Capas
  return <Componente {...props} />
}
