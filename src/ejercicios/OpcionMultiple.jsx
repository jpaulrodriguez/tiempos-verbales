import { useMemo } from 'react'
import { barajar } from '../motor/seleccion.js'
import Enunciado from '../componentes/Enunciado.jsx'

export default function OpcionMultiple({ item, valor, setValor, bloqueado, resultado }) {
  // Barajamos una sola vez por ítem: si se rebarajara en cada render, las
  // opciones bailarían bajo el dedo del alumno al tocar.
  const opciones = useMemo(() => barajar(item.opciones || []), [item.id])

  return (
    <>
      <Enunciado item={item} hueco={valor} />
      <div className="opciones">
        {opciones.map((op) => {
          const elegida = valor === op
          const esCorrecta = op === item.respuesta
          let clase = 'opcion'
          if (elegida) clase += ' opcion--elegida'
          if (bloqueado && resultado) {
            if (esCorrecta) clase += ' opcion--bien'
            else if (elegida) clase += ' opcion--mal'
          }
          return (
            <button
              key={op}
              type="button"
              className={clase}
              disabled={bloqueado}
              onClick={() => setValor(op)}
            >
              {op}
            </button>
          )
        })}
      </div>
    </>
  )
}
