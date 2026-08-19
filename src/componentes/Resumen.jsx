import { Trofeo, Estrella, Rayo } from './Iconos.jsx'

export default function Resumen({ aciertos, total, xpGanado, fallados, onSeguir, onRepetirFallos }) {
  const porcentaje = total ? Math.round((aciertos / total) * 100) : 0
  const perfecta = aciertos === total && total > 0

  const titulo = perfecta
    ? '¡Lección perfecta!'
    : porcentaje >= 80 ? '¡Bien hecho!'
    : porcentaje >= 50 ? 'Vas mejorando'
    : 'Toca repasar'

  const Medalla = perfecta ? Trofeo : porcentaje >= 80 ? Estrella : Rayo

  return (
    <div className="resumen">
      <div className={`resumen__medalla ${porcentaje >= 80 ? 'resumen__medalla--verde' : ''}`}>
        <Medalla tam={40} />
      </div>
      <h2>{titulo}</h2>

      <div className="resumen__stats">
        <div className="stat stat--xp"><span className="stat__valor">+{xpGanado}</span><span className="stat__etiqueta">XP</span></div>
        <div className="stat stat--precision"><span className="stat__valor">{porcentaje}%</span><span className="stat__etiqueta">Aciertos</span></div>
        <div className="stat"><span className="stat__valor">{aciertos}/{total}</span><span className="stat__etiqueta">Correctas</span></div>
      </div>

      {fallados.length > 0 ? (
        <div className="resumen__fallos">
          <h3>Lo que se te ha atragantado</h3>
          <ul>
            {fallados.slice(0, 5).map((it) => (
              <li key={it.id}>
                <code>{it.respuesta || it.correccion || '—'}</code>
                <span>{it.explicacion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="resumen__acciones">
        {fallados.length > 0 ? (
          <button type="button" className="boton boton--azul boton--grande" onClick={onRepetirFallos}>
            Practicar los {fallados.length} fallos
          </button>
        ) : null}
        <button type="button" className="boton boton--verde boton--grande" onClick={onSeguir}>Continuar</button>
      </div>
    </div>
  )
}
