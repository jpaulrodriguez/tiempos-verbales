import { Adelante } from './Iconos.jsx'

/**
 * Índice de la guía teórica: la parte de «libro de consulta» de la app.
 *
 * Solo lista los temas cuya unidad existe en el currículo cargado: si el
 * profesor genera una app solo de ortografía, aquí no aparece el future
 * perfect. Así el índice y el mapa siempre cuentan la misma historia.
 */
export default function Guia({ teoria, unidadesIds, porId, onTema }) {
  return (
    <div className="guia">
      <h2 className="guia__titulo">Guía de consulta</h2>
      <p className="guia__intro">
        La estructura de cada tiempo — afirmativa, negativa y preguntas — con sus reglas y ejemplos.
      </p>

      {teoria.secciones.map((seccion) => {
        const temas = seccion.temas
          .map((id) => ({ id, ...teoria.temas[id] }))
          .filter((t) => t.titulo && (!t.unidad || unidadesIds.has(t.unidad)))
        if (!temas.length) return null

        return (
          <section key={seccion.id} className="bloque">
            <h3 className="bloque__titulo">{seccion.titulo}</h3>
            <div className="guia__lista">
              {temas.map((tema) => {
                // Los temas de consulta pura (demostrativos, artículos…) no
                // tienen unidad de práctica, así que declaran su nivel a mano.
                const nivel = tema.nivel || porId?.get(tema.unidad)?.nivel
                return (
                  <button key={tema.id} type="button" className="guia__fila" onClick={() => onTema(tema.id)}>
                    {nivel ? <span className={`nivel-insignia nivel-insignia--${nivel} nivel-insignia--mini`}>{nivel}</span> : null}
                    <span className="guia__fila-texto">
                      <strong>{tema.titulo}</strong>
                      <small>{tema.resumen}</small>
                    </span>
                    <Adelante tam={18} />
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
