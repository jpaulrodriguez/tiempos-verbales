import { useEffect, useRef } from 'react'
import Fichas from './Fichas.jsx'

export default function Traducir({ item, valor, setValor, bloqueado, resultado }) {
  const ref = useRef(null)
  const conFichas = Array.isArray(item.fichas) && item.fichas.length > 0

  useEffect(() => {
    if (!conFichas && !bloqueado) ref.current?.focus()
  }, [item.id, bloqueado, conFichas])

  return (
    <>
      <p className="enunciado enunciado--es">{item.enunciado}</p>
      {conFichas ? (
        <Fichas item={item} valor={valor} setValor={setValor} bloqueado={bloqueado} fichas={item.fichas} />
      ) : (
        <textarea
          ref={ref}
          className={`caja-texto ${resultado ? (resultado.correcta ? 'ok' : 'ko') : ''}`}
          value={valor || ''}
          onChange={(e) => setValor(e.target.value)}
          disabled={bloqueado}
          rows={2}
          placeholder="Escribe en inglés…"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
        />
      )}
    </>
  )
}
