import { desbloqueada, rangoNivel } from '../motor/progreso.js'
import { IconoUnidad, Candado, Corona, Check, Repetir, Diana, Adelante } from './Iconos.jsx'

function Coronas({ n }) {
  if (!n) return null
  return (
    <span className="nodo__coronas" aria-label={`${n} ${n === 1 ? 'corona' : 'coronas'}`}>
      {Array.from({ length: n }, (_, i) => <Corona key={i} tam={11} />)}
    </span>
  )
}

/**
 * La senda de unidades, agrupada por nivel del Marco.
 *
 * El nivel manda sobre el bloque temático (Presente / Pasado / Futuro) porque
 * es lo que el alumno ha elegido y lo que decide qué puede tocar. El bloque
 * sigue en los datos y lo usa la Guía, pero anidar dos agrupaciones en una
 * pantalla de 375px convierte el mapa en un acordeón ilegible.
 */
export default function MapaUnidades({
  unidades, niveles, progreso, vencidos, porId,
  onUnidad, onRepaso, onExamen, onSubirNivel,
}) {
  const delAlumno = rangoNivel(progreso.nivel)

  return (
    <div className="mapa">
      {vencidos > 0 ? (
        <button type="button" className="tarjeta tarjeta--repaso" onClick={onRepaso}>
          <span className="tarjeta__icono"><Repetir tam={22} /></span>
          <span>
            <strong>Repaso pendiente</strong>
            <small>{vencidos} {vencidos === 1 ? 'ejercicio toca' : 'ejercicios tocan'} hoy</small>
          </span>
        </button>
      ) : null}

      {niveles.map((nivel) => {
        const suyas = unidades.filter((u) => u.nivel === nivel.id)
        if (!suyas.length) return null

        const rango = rangoNivel(nivel.id)
        const esElSuyo = rango === delAlumno
        const porEncima = rango > delAlumno
        const hechas = suyas.filter((u) => progreso.unidades[u.id]?.completada).length

        return (
          <section key={nivel.id} className={`nivel-seccion ${porEncima ? 'nivel-seccion--futura' : ''}`}>
            <header className="nivel-cabecera">
              <span className={`nivel-insignia nivel-insignia--${nivel.id}`}>{nivel.id}</span>
              <span className="nivel-cabecera__texto">
                <strong>{nivel.titulo}</strong>
                <small>
                  {porEncima
                    ? 'Sube de nivel para abrirlo'
                    : `${hechas} de ${suyas.length} completadas`}
                </small>
              </span>
              {esElSuyo ? <span className="nivel-aqui">Estás aquí</span> : null}
            </header>

            <div className="senda">
              {suyas.map((u, i) => {
                const estado = progreso.unidades[u.id]
                const abierta = desbloqueada(u, progreso, porId)
                const coronas = estado?.coronas || 0
                const clase = [
                  'nodo',
                  !abierta && 'nodo--cerrado',
                  coronas >= 3 && 'nodo--oro',
                ].filter(Boolean).join(' ')

                // La senda serpentea para que la columna no sea una lista plana.
                // Se emite solo el sentido (-1, 0, 1); cuánto se desplaza lo
                // decide el CSS, que es quien sabe el ancho de la pantalla.
                const sentido = i % 4 === 1 ? 1 : i % 4 === 3 ? -1 : 0

                return (
                  <div key={u.id} className="senda__fila" style={{ '--sentido': sentido }}>
                    <button
                      type="button" className={clase} disabled={!abierta} onClick={() => onUnidad(u)}
                      aria-label={abierta
                        ? `${u.titulo}${estado?.completada ? ', completada' : ''}${coronas ? `, ${coronas} coronas` : ''}`
                        : porEncima
                          ? `${u.titulo}, nivel ${u.nivel}. Sube de nivel para abrirla`
                          : `${u.titulo}, bloqueada. Completa la unidad anterior`}
                    >
                      {!abierta
                        ? <Candado tam={26} />
                        : estado?.completada
                          ? <Check tam={30} />
                          : <IconoUnidad glifo={u.icono} tam={28} />}
                      <Coronas n={coronas} />
                    </button>
                    <span className="senda__etiqueta">{u.titulo}</span>
                  </div>
                )
              })}
            </div>

            {/* El salto de nivel se ofrece justo donde se ha ganado, no escondido
                en ajustes: es el momento en que el alumno acaba de terminarlo. */}
            {esElSuyo && hechas === suyas.length && onSubirNivel ? (
              <button type="button" className="tarjeta tarjeta--subir" onClick={onSubirNivel}>
                <span className="tarjeta__icono"><Adelante tam={22} /></span>
                <span>
                  <strong>Has terminado {nivel.id}</strong>
                  <small>Desbloquea el siguiente nivel</small>
                </span>
              </button>
            ) : null}
          </section>
        )
      })}

      <button type="button" className="tarjeta tarjeta--examen" onClick={onExamen}>
        <span className="tarjeta__icono"><Diana tam={22} /></span>
        <span>
          <strong>Examen de diagnóstico</strong>
          <small>20 preguntas de todo lo que llevas abierto</small>
        </span>
      </button>
    </div>
  )
}
