import { useMemo, useState } from 'react'
import { barajar } from '../motor/seleccion.js'

export default function Emparejar({ item, valor, setValor, bloqueado }) {
  const pares = item.pares || []
  const izquierdas = useMemo(() => barajar(pares.map((p) => p.izquierda)), [item.id])
  const derechas = useMemo(() => barajar(pares.map((p) => p.derecha)), [item.id])
  const [activa, setActiva] = useState(null)

  const hechos = valor || {}
  const derechasUsadas = new Set(Object.values(hechos))

  const tocarIzquierda = (izq) => {
    if (bloqueado) return
    if (hechos[izq]) {
      // Tocar una pareja ya hecha la deshace: rectificar tiene que ser barato.
      const copia = { ...hechos }
      delete copia[izq]
      setValor(copia)
      setActiva(null)
      return
    }
    setActiva(activa === izq ? null : izq)
  }

  const tocarDerecha = (der) => {
    if (bloqueado || !activa || derechasUsadas.has(der)) return
    setValor({ ...hechos, [activa]: der })
    setActiva(null)
  }

  const claseIzq = (izq) => {
    if (hechos[izq]) {
      if (!bloqueado) return 'par par--hecho'
      const correcta = pares.find((p) => p.izquierda === izq)?.derecha === hechos[izq]
      return `par par--hecho ${correcta ? 'par--bien' : 'par--mal'}`
    }
    return `par ${activa === izq ? 'par--activo' : ''}`
  }

  return (
    <>
      {/* La mecánica de dos toques no es evidente la primera vez. El aviso
          desaparece en cuanto el alumno hace la primera pareja: ya lo ha pillado. */}
      {Object.keys(hechos).length === 0 && !bloqueado ? (
        <p className="emparejar__ayuda">Toca una palabra de la izquierda y luego su pareja de la derecha.</p>
      ) : null}
      <div className="emparejar">
      <div className="emparejar__col">
        {izquierdas.map((izq) => (
          <button key={izq} type="button" className={claseIzq(izq)} onClick={() => tocarIzquierda(izq)} disabled={bloqueado && !hechos[izq]}>
            {izq}
            {hechos[izq] && <span className="par__eco">{hechos[izq]}</span>}
          </button>
        ))}
      </div>
      <div className="emparejar__col">
        {derechas.map((der) => (
          <button
            key={der}
            type="button"
            className={`par ${derechasUsadas.has(der) ? 'par--usado' : ''}`}
            onClick={() => tocarDerecha(der)}
            disabled={bloqueado || derechasUsadas.has(der)}
          >
            {der}
          </button>
        ))}
      </div>
      </div>
    </>
  )
}
