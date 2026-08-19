import { useEffect, useRef } from 'react'
import { Abajo } from '../componentes/Iconos.jsx'

const ETIQUETAS = {
  negativa: 'Pásala a negativa',
  pregunta_yn: 'Conviértela en pregunta de sí/no',
  pregunta_wh: 'Conviértela en pregunta WH-',
  afirmativa: 'Pásala a afirmativa',
}

export default function Transformar({ item, valor, setValor, bloqueado, resultado }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!bloqueado) ref.current?.focus()
  }, [item.id, bloqueado])

  return (
    <>
      <p className="transformar__origen">{item.enunciado}</p>
      <p className="transformar__flecha">
        <Abajo tam={18} /> {ETIQUETAS[item.transformacion] || 'Transforma la frase'}
      </p>
      <textarea
        ref={ref}
        className={`caja-texto ${resultado ? (resultado.correcta ? 'ok' : 'ko') : ''}`}
        value={valor || ''}
        onChange={(e) => setValor(e.target.value)}
        disabled={bloqueado}
        rows={2}
        autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false"
      />
    </>
  )
}
