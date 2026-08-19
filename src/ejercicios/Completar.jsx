import { useEffect, useRef } from 'react'
import Enunciado from '../componentes/Enunciado.jsx'

export default function Completar({ item, valor, setValor, bloqueado, resultado }) {
  const ref = useRef(null)

  useEffect(() => {
    // Foco automático: en móvil abre el teclado sin un toque extra.
    if (!bloqueado) ref.current?.focus()
  }, [item.id, bloqueado])

  const input = (
    <input
      ref={ref}
      className={`hueco-input ${resultado ? (resultado.correcta ? 'ok' : 'ko') : ''}`}
      value={valor || ''}
      onChange={(e) => setValor(e.target.value)}
      disabled={bloqueado}
      // Sin estas cuatro, iOS "corrige" las respuestas en inglés y el alumno
      // pierde corazones por culpa del autocorrector, no por su gramática.
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck="false"
      inputMode="text"
      placeholder="…"
      size={Math.max(6, (item.respuesta || '').length + 2)}
    />
  )

  return <Enunciado item={item} comoInput={input} />
}
