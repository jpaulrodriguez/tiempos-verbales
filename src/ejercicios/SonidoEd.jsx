import { useEffect } from 'react'
import { hablar, hayVoz } from '../motor/audio.js'
import { Altavoz } from '../componentes/Iconos.jsx'

const OPCIONES = ['/ɪd/', '/t/', '/d/']
const EJEMPLOS = { '/ɪd/': 'wanted · una sílaba más', '/t/': 'stopped · seco', '/d/': 'played · suave' }

export default function SonidoEd({ item, valor, setValor, bloqueado, resultado }) {
  useEffect(() => {
    // Se pronuncia solo al aparecer: el ítem va de oír, no de leer.
    hablar(item.palabra, { lento: true })
  }, [item.id])

  return (
    <>
      <div className="sonido">
        <button
          type="button" className="altavoz"
          onClick={() => hablar(item.palabra, { lento: true })}
          aria-label={`Escuchar ${item.palabra} de nuevo`}
        >
          <Altavoz tam={28} />
        </button>
        <div>
          <p className="sonido__palabra">{item.palabra}</p>
          {item.base ? <p className="sonido__base">de <em>{item.base}</em></p> : null}
        </div>
      </div>

      {!hayVoz() && <p className="aviso">Tu navegador no tiene voz: fíjate en el último sonido del verbo base.</p>}

      <div className="opciones">
        {OPCIONES.map((op) => {
          const elegida = valor === op
          let clase = 'opcion opcion--fonema'
          if (elegida) clase += ' opcion--elegida'
          if (bloqueado && resultado) {
            if (op === item.respuesta) clase += ' opcion--bien'
            else if (elegida) clase += ' opcion--mal'
          }
          return (
            <button key={op} type="button" className={clase} disabled={bloqueado} onClick={() => setValor(op)}>
              <span className="fonema">{op}</span>
              <span className="fonema__ej">{EJEMPLOS[op]}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
