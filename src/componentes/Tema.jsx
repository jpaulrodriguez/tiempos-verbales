import { Atras, Bombilla, Rayo } from './Iconos.jsx'
import { hablar, hayVoz } from '../motor/audio.js'
import { Altavoz } from './Iconos.jsx'

const TIPOS = {
  afirmativa: { etiqueta: 'Afirmativa', clase: 'estructura--afirmativa' },
  negativa: { etiqueta: 'Negativa', clase: 'estructura--negativa' },
  pregunta_yn: { etiqueta: 'Pregunta sí / no', clase: 'estructura--yn' },
  pregunta_wh: { etiqueta: 'Pregunta WH-', clase: 'estructura--wh' },
}

/**
 * Ficha de consulta de un tema: usos, marcadores, las cuatro estructuras con
 * su fórmula troceada en piezas, y las reglas o notas que apliquen.
 *
 * La fórmula se pinta como fichas separadas por + en lugar de una línea de
 * texto: el orden de las piezas ES el contenido que se enseña, y trocearlo
 * visualmente es lo que lo hace escaneable en un repaso de treinta segundos.
 */
export default function Tema({ tema, onVolver, onPracticar }) {
  if (!tema) return null

  return (
    <div className="tema">
      <div className="perfil__cabecera">
        <button type="button" className="icono-boton" onClick={onVolver} aria-label="Volver a la guía">
          <Atras tam={22} />
        </button>
        <h2>{tema.titulo}</h2>
      </div>

      {tema.metafora ? <p className="tema__metafora">{tema.metafora}</p> : null}

      {tema.usos?.length ? (
        <section className="tema__seccion">
          <h3 className="bloque__titulo">Cuándo se usa</h3>
          <ul className="tema__usos">
            {tema.usos.map((uso) => <li key={uso}>{uso}</li>)}
          </ul>
        </section>
      ) : null}

      {tema.marcadores?.length ? (
        <section className="tema__seccion">
          <h3 className="bloque__titulo">Palabras que lo delatan</h3>
          <div className="tema__chips">
            {tema.marcadores.map((m) => <span key={m} className="chip">{m}</span>)}
          </div>
        </section>
      ) : null}

      {tema.estructuras?.length ? (
        <section className="tema__seccion">
          <h3 className="bloque__titulo">Estructura</h3>
          <div className="tema__estructuras">
            {tema.estructuras.map((e) => {
              const tipo = TIPOS[e.tipo] || { etiqueta: e.tipo, clase: '' }
              return (
                <article key={e.tipo} className={`estructura ${tipo.clase}`}>
                  <span className="estructura__tipo">{tipo.etiqueta}</span>
                  <div className="estructura__formula">
                    {e.formula.split(' + ').map((pieza, i) => (
                      <span key={i} className="estructura__pieza">{pieza}</span>
                    ))}
                  </div>
                  <p className="estructura__ejemplo">
                    {e.ejemplo}
                    {hayVoz() ? (
                      <button
                        type="button" className="estructura__oir"
                        onClick={() => hablar(e.ejemplo)}
                        aria-label={`Escuchar: ${e.ejemplo}`}
                      >
                        <Altavoz tam={16} />
                      </button>
                    ) : null}
                  </p>
                  <p className="estructura__traduccion">{e.traduccion}</p>
                  {e.respuestas ? <p className="estructura__respuestas">{e.respuestas}</p> : null}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {tema.reglas?.length ? (
        <section className="tema__seccion">
          <h3 className="bloque__titulo">Las reglas</h3>
          <div className="tema__estructuras">
            {tema.reglas.map((r) => (
              <article key={r.titulo} className="estructura estructura--regla">
                <span className="estructura__tipo">{r.titulo}</span>
                <p className="estructura__detalle">{r.detalle}</p>
                <div className="tema__chips">
                  {r.ejemplos.map((ej) => <span key={ej} className="chip chip--ejemplo">{ej}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tema.notas?.length ? (
        <section className="tema__seccion">
          {tema.notas.map((n) => (
            <aside key={n.titulo} className="tema__nota">
              <Bombilla tam={20} />
              <div>
                <strong>{n.titulo}.</strong> {n.texto}
              </div>
            </aside>
          ))}
        </section>
      ) : null}

      {tema.unidad ? (
        <button type="button" className="boton boton--verde boton--grande tema__practicar" onClick={() => onPracticar(tema.unidad)}>
          <Rayo tam={18} /> Practicar esto
        </button>
      ) : null}
    </div>
  )
}
