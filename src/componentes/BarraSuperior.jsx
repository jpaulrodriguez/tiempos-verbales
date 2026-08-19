import { CORAZONES_MAX } from '../motor/progreso.js'
import { Llama, Gema, Corazon } from './Iconos.jsx'

export function Corazones({ cantidad }) {
  return (
    <span className="corazones" role="img" aria-label={`${cantidad} de ${CORAZONES_MAX} corazones`}>
      {Array.from({ length: CORAZONES_MAX }, (_, i) => (
        <Corazon key={i} tam={20} relleno={i < cantidad} className={i < cantidad ? '' : 'corazon--gastado'} />
      ))}
    </span>
  )
}

export default function BarraSuperior({ progreso, onPerfil }) {
  return (
    <header className="barra">
      <button
        type="button" className="marcador marcador--racha" onClick={onPerfil}
        aria-label={`Racha de ${progreso.racha} días. Ver progreso`}
      >
        <Llama tam={20} />
        <span className="marcador__valor">{progreso.racha}</span>
      </button>

      <button
        type="button" className="marcador marcador--gemas" onClick={onPerfil}
        aria-label={`${progreso.xp} puntos de experiencia. Ver progreso`}
      >
        <Gema tam={20} />
        <span className="marcador__valor">{progreso.xp}</span>
      </button>

      <Corazones cantidad={progreso.corazones} />
    </header>
  )
}
