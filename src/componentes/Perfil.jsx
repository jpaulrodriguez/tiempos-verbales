import { puntosDebiles } from '../motor/progreso.js'
import { Atras, Grafico } from './Iconos.jsx'

export default function Perfil({ progreso, nombresReglas, niveles, onVolver, onPracticar, onNivel, onReiniciar }) {
  const debiles = puntosDebiles(progreso)
  const totalIntentos = Object.values(progreso.reglas).reduce((n, r) => n + r.intentos, 0)
  const totalAciertos = Object.values(progreso.reglas).reduce((n, r) => n + r.aciertos, 0)
  const precision = totalIntentos ? Math.round((totalAciertos / totalIntentos) * 100) : 0

  return (
    <div className="perfil">
      <div className="perfil__cabecera">
        <button type="button" className="icono-boton" onClick={onVolver} aria-label="Volver al mapa">
          <Atras tam={22} />
        </button>
        <h2>Tu progreso</h2>
      </div>

      <div className="resumen__stats">
        <div className="stat"><span className="stat__valor">{progreso.racha}</span><span className="stat__etiqueta">Días seguidos</span></div>
        <div className="stat stat--xp"><span className="stat__valor">{progreso.xp}</span><span className="stat__etiqueta">XP total</span></div>
        <div className="stat stat--precision"><span className="stat__valor">{precision}%</span><span className="stat__etiqueta">Precisión</span></div>
        <div className="stat"><span className="stat__valor">{progreso.lecciones}</span><span className="stat__etiqueta">Lecciones</span></div>
      </div>

      <section className="debiles">
        <h3>Tu nivel</h3>
        <p className="debiles__vacio">
          Cambiarlo no borra nada: solo decide qué unidades tienes abiertas.
        </p>
        <div className="nivel-selector" role="group" aria-label="Elegir nivel">
          {niveles.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`nivel-opcion ${progreso.nivel === n.id ? 'nivel-opcion--activa' : ''}`}
              aria-pressed={progreso.nivel === n.id}
              onClick={() => onNivel(n.id)}
            >
              <span className={`nivel-insignia nivel-insignia--${n.id}`}>{n.id}</span>
              <small>{n.titulo}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="debiles">
        <h3><Grafico tam={16} /> Dónde fallas más</h3>
        {debiles.length === 0 ? (
          <p className="debiles__vacio">
            {totalIntentos < 10
              ? 'Haz un par de lecciones más y aquí verás qué reglas se te resisten.'
              : 'No hay ninguna regla por debajo del 80%. Buen nivel.'}
          </p>
        ) : (
          <>
            <ul className="debiles__lista">
              {debiles.map((r) => (
                <li key={r.id}>
                  <div className="debil__nombre">{nombresReglas[r.id] || r.id}</div>
                  <div className="debil__barra">
                    <div className="debil__relleno" style={{ width: `${Math.round(r.tasa * 100)}%` }} />
                  </div>
                  <div className="debil__cifra">{Math.round(r.tasa * 100)}% de aciertos · {r.intentos} intentos</div>
                </li>
              ))}
            </ul>
            <button type="button" className="boton boton--azul boton--grande" onClick={() => onPracticar(debiles.map((r) => r.id))}>
              Practicar solo esto
            </button>
          </>
        )}
      </section>

      <button
        type="button" className="boton boton--texto boton--peligro"
        onClick={() => { if (confirm('Se borrará todo tu progreso. ¿Seguro?')) onReiniciar() }}
      >
        Reiniciar progreso
      </button>
    </div>
  )
}
