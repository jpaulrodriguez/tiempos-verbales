import { Check, Cruz } from './Iconos.jsx'

/**
 * Panel que sube desde abajo tras responder.
 *
 * Se muestra tanto al fallar como al acertar, y siempre con la explicación:
 * el acierto por intuición sin saber por qué también es una laguna, solo que
 * silenciosa. Es el único texto que el alumno lee con atención de verdad,
 * porque acaba de invertir esfuerzo en responder.
 */
export default function Feedback({ resultado, item, esperado, onContinuar }) {
  if (!resultado) return null
  const { correcta, casi } = resultado

  return (
    <div className={`feedback ${correcta ? 'feedback--bien' : 'feedback--mal'}`} role="status" aria-live="polite">
      <div className="feedback__cabecera">
        <span className="feedback__icono">
          {correcta ? <Check tam={20} /> : <Cruz tam={20} />}
        </span>
        <strong>{correcta ? (casi ? '¡Casi! Cuidado con la ortografía' : '¡Correcto!') : 'No es esa'}</strong>
      </div>

      {(!correcta || casi) && esperado ? (
        <p className="feedback__solucion">
          <span className="feedback__etiqueta">Respuesta:</span> {esperado}
        </p>
      ) : null}

      {item.explicacion ? <p className="feedback__explicacion">{item.explicacion}</p> : null}

      <button
        type="button"
        className={`boton boton--grande ${correcta ? 'boton--verde' : 'boton--rojo'}`}
        onClick={onContinuar}
        autoFocus
      >
        Continuar
      </button>
    </div>
  )
}
