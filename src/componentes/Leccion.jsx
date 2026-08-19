import { useState } from 'react'
import Ejercicio from '../ejercicios/index.jsx'
import Feedback from './Feedback.jsx'
import { Corazones } from './BarraSuperior.jsx'
import { Cruz, Rayo, Bombilla, Corazon } from './Iconos.jsx'
import { evaluar, hayRespuesta, textoEsperado } from '../motor/validar.js'
import { sonarAcierto, sonarFallo, vibrar } from '../motor/audio.js'

/** A cuántos ítems de distancia vuelve un fallo dentro de la misma lección. */
const DISTANCIA_REENCOLADO = 3

export default function Leccion({ sesion, progreso, onRespuesta, onTerminar, onSalir, onRecuperar, onPista }) {
  const [cola, setCola] = useState(sesion.items)
  const [indice, setIndice] = useState(0)
  const [valor, setValor] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [aciertos, setAciertos] = useState(0)
  const [combo, setCombo] = useState(0)
  const [reencolados, setReencolados] = useState(() => new Set())
  const [fallados, setFallados] = useState([])
  const [verPista, setVerPista] = useState(false)

  const item = cola[indice]
  /**
   * La prueba de clasificación mide, no enseña, y por eso desactiva dos cosas:
   * los corazones (unas vidas que nunca bajan solo despistan) y el reencolado
   * de fallos. Lo segundo importa más de lo que parece: reencolar convertía una
   * prueba anunciada como de 15 preguntas en una de 25, y quien se sienta a
   * clasificarse ha aceptado 15.
   */
  const esPrueba = sesion.tipo === 'prueba'
  const sinCorazones = !esPrueba && progreso.corazones <= 0 && !resultado

  /**
   * Limpiar la respuesta al cambiar de ejercicio, DURANTE el render.
   *
   * Con un useEffect esto ocurría demasiado tarde: el efecto corre después de
   * pintar, así que el ejercicio nuevo alcanzaba a renderizarse una vez con la
   * respuesta del anterior. Pasar de un `emparejar` (cuya respuesta es un
   * objeto de parejas) a un `opcion_multiple` (que pinta la respuesta como
   * texto) tumbaba la app entera a pantalla blanca.
   *
   * Se compara el índice y no el id del ítem porque un fallo reencola el mismo
   * ítem más adelante: mismo id, posición distinta, y ahí también hay que
   * limpiar. Ver https://react.dev/learn/you-might-not-need-an-effect
   */
  const [indicePrevio, setIndicePrevio] = useState(indice)
  if (indice !== indicePrevio) {
    setIndicePrevio(indice)
    setValor(null)
    setResultado(null)
    setVerPista(false)
  }

  if (!item) return null

  const comprobar = () => {
    if (resultado || !hayRespuesta(item, valor)) return
    const res = evaluar(item, valor)
    setResultado(res)
    onRespuesta(item, res.correcta)

    if (res.correcta) {
      setAciertos((n) => n + 1)
      setCombo((c) => c + 1)
      sonarAcierto()
    } else {
      setCombo(0)
      setFallados((f) => (f.some((x) => x.id === item.id) ? f : [...f, item]))
      sonarFallo()
      vibrar(40)
      // Lo fallado vuelve unos ítems más adelante: el alumno acaba de leer la
      // explicación y aplicarla en caliente es lo que la fija.
      if (!esPrueba && !reencolados.has(item.id)) {
        setReencolados((s) => new Set(s).add(item.id))
        setCola((c) => {
          const copia = [...c]
          copia.splice(Math.min(indice + DISTANCIA_REENCOLADO, copia.length), 0, item)
          return copia
        })
      }
    }
  }

  const continuar = () => {
    if (indice + 1 >= cola.length) onTerminar({ aciertos, total: cola.length, fallados })
    else setIndice((i) => i + 1)
  }

  const teclado = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    resultado ? continuar() : comprobar()
  }

  const avance = cola.length ? indice / cola.length : 0
  const listo = hayRespuesta(item, valor)

  return (
    <div className="leccion" onKeyDown={teclado}>
      <div className="leccion__cabecera">
        <button type="button" className="icono-boton" onClick={onSalir} aria-label="Salir de la lección">
          <Cruz tam={22} />
        </button>
        <div
          className="progreso" role="progressbar"
          aria-valuenow={indice} aria-valuemin={0} aria-valuemax={cola.length}
          aria-label="Progreso de la lección"
        >
          {/* scaleX y no width: así el avance no dispara layout en cada respuesta */}
          <div className="progreso__relleno" style={{ transform: `scaleX(${avance})` }} />
        </div>
        {esPrueba
          ? <span className="leccion__contador">{indice + 1}/{cola.length}</span>
          : <Corazones cantidad={progreso.corazones} />}
      </div>

      {combo >= 3 && !resultado ? (
        <p className="combo"><Rayo tam={15} /> {combo} seguidas</p>
      ) : null}

      <main className="leccion__cuerpo">
        <h2 className="consigna">{item.consigna || 'Completa la frase'}</h2>
        <Ejercicio item={item} valor={valor} setValor={setValor} bloqueado={!!resultado} resultado={resultado} />

        {item.pista && !resultado ? (
          verPista ? (
            <p className="pista"><Bombilla tam={20} /> <span>{item.pista}</span></p>
          ) : (
            <button type="button" className="pista__boton" onClick={() => { setVerPista(true); onPista() }}>
              <Bombilla tam={18} /> Ver pista (−2 XP)
            </button>
          )
        ) : null}
      </main>

      {!resultado ? (
        <footer className="leccion__pie">
          <button
            type="button"
            className={`boton boton--grande ${listo ? 'boton--verde' : 'boton--apagado'}`}
            onClick={comprobar} disabled={!listo}
          >
            Comprobar
          </button>
        </footer>
      ) : (
        <Feedback resultado={resultado} item={item} esperado={textoEsperado(item)} onContinuar={continuar} />
      )}

      {sinCorazones ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-sin-corazones">
          <div className="modal__caja">
            <div className="modal__icono"><Corazon tam={48} /></div>
            <h3 id="titulo-sin-corazones">Te has quedado sin corazones</h3>
            <p className="modal__texto">
              Repasa lo que has fallado y sigues con dos corazones más. Empezar de cero no enseña nada.
            </p>
            <button
              type="button" className="boton boton--verde boton--grande"
              onClick={() => { onRecuperar(); setCola((c) => [...c, ...fallados]) }}
            >
              Repasar y recuperar
            </button>
            <button type="button" className="boton boton--texto" onClick={onSalir}>Salir al mapa</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
