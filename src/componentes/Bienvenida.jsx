import { Diana, Adelante } from './Iconos.jsx'

/**
 * Primera pantalla: el alumno elige por dónde entra.
 *
 * Las descripciones están escritas para que uno se reconozca sin saber qué
 * significa «A2»: hablan de lo que sabes decir y de lo que se te atraganta, no
 * de nomenclatura del Marco. Quien no se reconozca en ninguna tiene abajo la
 * prueba de quince preguntas, que decide por él.
 */
export default function Bienvenida({ niveles, onElegir, onPrueba }) {
  return (
    <div className="bienvenida">
      <h1 className="bienvenida__titulo">¿Por dónde empiezas?</h1>
      <p className="bienvenida__intro">
        Elige el punto donde estás ahora. Podrás cambiarlo cuando quieras desde tu perfil.
      </p>

      <div className="bienvenida__opciones">
        {niveles.map((n) => (
          <button key={n.id} type="button" className="nivel-carta" onClick={() => onElegir(n.id)}>
            <span className={`nivel-insignia nivel-insignia--${n.id}`}>{n.id}</span>
            <span className="nivel-carta__texto">
              <strong>{n.titulo}</strong>
              <span className="nivel-carta__frase">«{n.descripcion}»</span>
              <small>{n.cubre}</small>
            </span>
            <Adelante tam={18} />
          </button>
        ))}
      </div>

      <button type="button" className="tarjeta tarjeta--examen" onClick={onPrueba}>
        <span className="tarjeta__icono"><Diana tam={22} /></span>
        <span>
          <strong>No estoy seguro</strong>
          <small>15 preguntas y te digo tu nivel</small>
        </span>
      </button>
    </div>
  )
}
