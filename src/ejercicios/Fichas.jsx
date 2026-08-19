import { useMemo } from 'react'
import { barajar } from '../motor/seleccion.js'

/**
 * Banco de palabras: el alumno toca fichas para construir la frase y las
 * devuelve tocándolas arriba. Es el formato que mejor enseña orden de palabras,
 * porque obliga a decidir la posición de auxiliares y sujeto sin escribir.
 *
 * Se usa tanto en `ordenar` como en `traducir` con fichas.
 */
export default function Fichas({ item, valor, setValor, bloqueado, fichas }) {
  const disponibles = useMemo(
    () => barajar(fichas || []).map((t, i) => ({ id: `${i}-${t}`, texto: t })),
    [item.id]
  )
  const elegidas = valor || []
  const usados = new Set(elegidas.map((f) => f.id))

  const anadir = (ficha) => !bloqueado && setValor([...elegidas, ficha])
  const quitar = (idx) => !bloqueado && setValor(elegidas.filter((_, i) => i !== idx))

  return (
    <div className="fichas">
      <div className="fichas__linea">
        {elegidas.length === 0 && <span className="fichas__vacio">Toca las palabras en orden</span>}
        {elegidas.map((f, i) => (
          <button key={`${f.id}-${i}`} type="button" className="ficha ficha--puesta" onClick={() => quitar(i)}>
            {f.texto}
          </button>
        ))}
      </div>
      <div className="fichas__banco">
        {disponibles.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ficha ${usados.has(f.id) ? 'ficha--usada' : ''}`}
            disabled={bloqueado || usados.has(f.id)}
            onClick={() => anadir(f)}
          >
            {f.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
