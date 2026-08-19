import { useEffect, useRef } from 'react'
import { hablar, hayVoz } from '../motor/audio.js'
import { Altavoz } from '../componentes/Iconos.jsx'

export default function Escuchar({ item, valor, setValor, bloqueado, resultado }) {
  const ref = useRef(null)

  useEffect(() => {
    hablar(item.texto)
    if (!bloqueado) ref.current?.focus()
  }, [item.id, bloqueado])

  if (!hayVoz()) {
    // Sin voz el ítem no tiene sentido; se enseña la frase y se pide copiarla,
    // que al menos refuerza la ortografía en vez de romper la lección.
    return (
      <>
        <p className="aviso">Tu navegador no puede reproducir voz. Copia la frase:</p>
        <p className="enunciado">{item.texto}</p>
        <input
          className="caja-texto" value={valor || ''} onChange={(e) => setValor(e.target.value)}
          disabled={bloqueado} autoCapitalize="off" autoCorrect="off" spellCheck="false"
        />
      </>
    )
  }

  return (
    <>
      <div className="escuchar">
        <button type="button" className="altavoz altavoz--grande" onClick={() => hablar(item.texto)} aria-label="Escuchar la frase">
          <Altavoz tam={40} />
        </button>
        <button
          type="button" className="altavoz altavoz--lento"
          onClick={() => hablar(item.texto, { lento: true })}
          aria-label="Escuchar la frase más despacio"
        >
          <Altavoz tam={26} ondas={1} />
        </button>
      </div>
      <textarea
        ref={ref}
        className={`caja-texto ${resultado ? (resultado.correcta ? 'ok' : 'ko') : ''}`}
        value={valor || ''}
        onChange={(e) => setValor(e.target.value)}
        disabled={bloqueado}
        rows={2}
        placeholder="Escribe lo que oyes…"
        autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false"
      />
    </>
  )
}
