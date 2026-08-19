import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import banco from './data/banco.json'
import curriculo from './data/unidades.json'
import teoria from './data/teoria.json'

import BarraSuperior from './componentes/BarraSuperior.jsx'
import BarraTabs from './componentes/BarraTabs.jsx'
import MapaUnidades from './componentes/MapaUnidades.jsx'
import Bienvenida from './componentes/Bienvenida.jsx'
import Guia from './componentes/Guia.jsx'
import Tema from './componentes/Tema.jsx'
/**
 * El listado de verbos va en su propio paquete.
 *
 * Son 520 verbos con cinco formas cada uno: bastante peso para algo que la
 * mayoría no abre. Así quien solo hace la lección del día no se lo descarga,
 * y quien entra en la pestaña lo recibe en ese momento.
 */
const Verbos = lazy(() => import('./componentes/Verbos.jsx'))
import Leccion from './componentes/Leccion.jsx'
import Resumen from './componentes/Resumen.jsx'
import Perfil from './componentes/Perfil.jsx'
import { Libro, Diana } from './componentes/Iconos.jsx'

import {
  cargar, guardar, reiniciar, revisarRacha,
  registrarRespuesta, registrarLeccion,
  perderCorazon, recuperarCorazones, gastarXP,
  fijarNivel, nivelSegunPrueba, siguienteNivel, rangoNivel,
} from './motor/progreso.js'
import { contarVencidos } from './motor/srs.js'
import {
  construirLeccion, construirRepaso, construirPractica, construirExamen, construirPrueba,
} from './motor/seleccion.js'

export default function App() {
  const [progreso, setProgreso] = useState(() => revisarRacha(cargar()))
  const [pantalla, setPantalla] = useState('mapa')
  const [sesion, setSesion] = useState(null)
  const [resultadoFinal, setResultadoFinal] = useState(null)
  const [temaActivo, setTemaActivo] = useState(null)
  const [nivelSugerido, setNivelSugerido] = useState(null)

  useEffect(() => { guardar(progreso) }, [progreso])
  useEffect(() => { window.scrollTo(0, 0) }, [pantalla, temaActivo])

  const unidades = curriculo.unidades || []
  const niveles = curriculo.niveles || []
  const nombresReglas = curriculo.reglas || {}
  const vencidos = useMemo(() => contarVencidos(banco, progreso.items), [progreso.items])
  const unidadesIds = useMemo(() => new Set(unidades.map((u) => u.id)), [unidades])
  const porId = useMemo(() => new Map(unidades.map((u) => [u.id, u])), [unidades])

  /** Nivel MCER de un ítem, heredado de la unidad a la que pertenece. */
  const nivelDeItem = (item) => porId.get(item.unidad)?.nivel || 'A1'

  /**
   * Tema de la guía que corresponde a una unidad. Casi todos comparten id;
   * para las unidades de contraste se busca el tema que las declara como suya
   * (p. ej. el tema `stative` señala a la unidad `contraste-presente`).
   */
  const temaDeUnidad = (unidadId) => {
    if (teoria.temas[unidadId]) return unidadId
    return Object.keys(teoria.temas).find((k) => teoria.temas[k].unidad === unidadId) || null
  }

  const abrir = (nueva) => {
    if (!nueva.items.length) {
      alert('No hay ejercicios disponibles para esta sesión.')
      return
    }
    setSesion(nueva)
    setPantalla(nueva.metafora ? 'metafora' : 'leccion')
  }

  const empezarUnidad = (unidad) => {
    const coronas = progreso.unidades[unidad.id]?.coronas || 0
    abrir({
      tipo: 'unidad',
      unidadId: unidad.id,
      titulo: unidad.titulo,
      metafora: coronas === 0 ? unidad.metafora : null,
      items: construirLeccion({ banco, unidadId: unidad.id, progreso, coronas }),
    })
  }

  const empezarRepaso = () =>
    abrir({ tipo: 'repaso', unidadId: '__repaso__', titulo: 'Repaso', items: construirRepaso({ banco, progreso }) })

  // El diagnóstico solo pregunta por lo que el alumno tiene abierto: medirle
  // con material de un nivel que aún no ha visto no diagnostica nada, frustra.
  const empezarExamen = () => {
    const aSuAlcance = banco.filter(
      (it) => rangoNivel(porId.get(it.unidad)?.nivel) <= rangoNivel(progreso.nivel)
    )
    abrir({ tipo: 'examen', unidadId: '__examen__', titulo: 'Diagnóstico', items: construirExamen({ banco: aSuAlcance }) })
  }

  const empezarPractica = (reglas) =>
    abrir({ tipo: 'practica', unidadId: '__practica__', titulo: 'Puntos débiles', items: construirPractica({ banco, reglas }) })

  const empezarPrueba = () =>
    abrir({
      tipo: 'prueba', unidadId: '__prueba__', titulo: 'Prueba de nivel',
      items: construirPrueba({ banco, unidades }),
    })

  const alResponder = (item, acierto) => {
    setProgreso((p) => {
      const conRespuesta = registrarRespuesta(p, item, acierto)
      // La prueba de nivel no gasta corazones: mide, no evalúa. Quedarse sin
      // vidas a mitad de una clasificación sería absurdo.
      if (sesion?.tipo === 'prueba') return conRespuesta
      return acierto ? conRespuesta : perderCorazon(conRespuesta)
    })
  }

  const alTerminar = ({ aciertos, total, fallados }) => {
    if (sesion.tipo === 'prueba') {
      // Se reconstruye el resultado por banda desde los ítems de la sesión:
      // lo que no está entre los fallados, se acertó.
      const fallo = new Set(fallados.map((f) => f.id))
      const porNivel = { A1: { aciertos: 0, total: 0 }, A2: { aciertos: 0, total: 0 }, B1: { aciertos: 0, total: 0 } }
      for (const it of sesion.items) {
        const banda = porNivel[nivelDeItem(it)]
        if (!banda) continue
        banda.total++
        if (!fallo.has(it.id)) banda.aciertos++
      }
      const sugerido = nivelSegunPrueba(porNivel)
      setNivelSugerido({ nivel: sugerido, porNivel })
      setProgreso((p) => fijarNivel(p, sugerido))
      setPantalla('resultado-nivel')
      return
    }

    // El examen y la práctica dirigida no otorgan coronas: no son una unidad.
    const cuentaComoUnidad = sesion.tipo === 'unidad'
    setProgreso((p) => registrarLeccion(p, {
      unidadId: cuentaComoUnidad ? sesion.unidadId : '__suelta__',
      aciertos,
      total,
    }))
    setResultadoFinal({ aciertos, total, fallados })
    setPantalla('resumen')
  }

  const subirNivel = () => {
    const siguiente = siguienteNivel(progreso.nivel)
    if (siguiente) setProgreso((p) => fijarNivel(p, siguiente))
  }

  const volverAlMapa = () => { setSesion(null); setResultadoFinal(null); setPantalla('mapa') }

  const abrirTema = (id) => { setTemaActivo(id); setPantalla('tema') }

  // «Practicar esto» desde la guía arranca la lección de esa unidad aunque el
  // mapa la tenga bloqueada: quien llega por la teoría viene a propósito, y si
  // supera el 80% se la gana igual que por la senda.
  const practicarDesdeTeoria = (unidadId) => {
    const unidad = unidades.find((u) => u.id === unidadId)
    if (unidad) empezarUnidad(unidad)
  }

  // Sin nivel elegido no hay app: es lo primero que se pregunta.
  if (!progreso.nivel && pantalla !== 'leccion') {
    return (
      <div className="app app--centro">
        <Bienvenida
          niveles={niveles}
          onElegir={(n) => setProgreso((p) => fijarNivel(p, n))}
          onPrueba={empezarPrueba}
        />
      </div>
    )
  }

  if (pantalla === 'resultado-nivel' && nivelSugerido) {
    const { nivel, porNivel } = nivelSugerido
    const ficha = niveles.find((n) => n.id === nivel)
    return (
      <div className="app app--centro">
        <div className="resumen">
          <div className="resumen__medalla resumen__medalla--verde"><Diana tam={40} /></div>
          <h2>Tu nivel es {nivel}</h2>
          {ficha ? <p className="modal__texto">{ficha.cubre}</p> : null}

          <div className="resumen__stats">
            {['A1', 'A2', 'B1'].map((b) => (
              <div key={b} className="stat">
                <span className="stat__valor">{porNivel[b].aciertos}/{porNivel[b].total}</span>
                <span className="stat__etiqueta">{b}</span>
              </div>
            ))}
          </div>

          <p className="modal__texto">
            Empiezas en {nivel} porque es la primera parte que aún no dominas. Lo de abajo queda
            abierto para repasar cuando quieras, y puedes cambiar de nivel desde tu perfil.
          </p>

          <button
            type="button" className="boton boton--verde boton--grande"
            onClick={() => { setNivelSugerido(null); volverAlMapa() }}
          >
            Empezar
          </button>
        </div>
      </div>
    )
  }

  if (pantalla === 'metafora' && sesion) {
    const tema = sesion.tipo === 'unidad' ? temaDeUnidad(sesion.unidadId) : null
    return (
      <div className="app app--centro">
        <div className="metafora">
          <p className="metafora__etiqueta">{sesion.titulo}</p>
          <p className="metafora__texto">{sesion.metafora}</p>
          <button type="button" className="boton boton--verde boton--grande" onClick={() => setPantalla('leccion')}>
            Empezar
          </button>
          {tema ? (
            <button type="button" className="boton boton--texto" onClick={() => abrirTema(tema)}>
              <Libro tam={17} /> Ver la teoría primero
            </button>
          ) : null}
          <button type="button" className="boton boton--texto" onClick={volverAlMapa}>Ahora no</button>
        </div>
      </div>
    )
  }

  if (pantalla === 'leccion' && sesion) {
    return (
      <div className="app">
        <Leccion
          sesion={sesion}
          progreso={progreso}
          onRespuesta={alResponder}
          onTerminar={alTerminar}
          onSalir={volverAlMapa}
          onRecuperar={() => setProgreso((p) => recuperarCorazones(p, 2))}
          onPista={() => setProgreso((p) => gastarXP(p, 2))}
        />
      </div>
    )
  }

  if (pantalla === 'resumen' && resultadoFinal) {
    return (
      <div className="app app--centro">
        <Resumen
          {...resultadoFinal}
          xpGanado={progreso.xpUltimaLeccion || 0}
          onSeguir={volverAlMapa}
          onRepetirFallos={() => abrir({
            tipo: 'practica',
            unidadId: '__fallos__',
            titulo: 'Tus fallos',
            items: resultadoFinal.fallados,
          })}
        />
      </div>
    )
  }

  if (pantalla === 'tema') {
    return (
      <div className="app app--con-tabs">
        <Tema
          tema={teoria.temas[temaActivo]}
          onVolver={() => setPantalla('guia')}
          onPracticar={practicarDesdeTeoria}
        />
        <BarraTabs activa="guia" onCambiar={setPantalla} />
      </div>
    )
  }

  if (pantalla === 'verbos') {
    return (
      <div className="app app--con-tabs">
        <Suspense fallback={<p className="aviso">Cargando los verbos…</p>}>
          <Verbos />
        </Suspense>
        <BarraTabs activa="verbos" onCambiar={setPantalla} />
      </div>
    )
  }

  if (pantalla === 'guia') {
    return (
      <div className="app app--con-tabs">
        <Guia teoria={teoria} unidadesIds={unidadesIds} porId={porId} onTema={abrirTema} />
        <BarraTabs activa="guia" onCambiar={setPantalla} />
      </div>
    )
  }

  if (pantalla === 'perfil') {
    return (
      <div className="app app--con-tabs">
        <Perfil
          progreso={progreso}
          nombresReglas={nombresReglas}
          niveles={niveles}
          onVolver={() => setPantalla('mapa')}
          onPracticar={(reglas) => empezarPractica(reglas)}
          onNivel={(n) => setProgreso((p) => fijarNivel(p, n))}
          onReiniciar={() => { setProgreso(reiniciar()); setPantalla('mapa') }}
        />
        <BarraTabs activa="perfil" onCambiar={setPantalla} />
      </div>
    )
  }

  return (
    <div className="app app--con-tabs">
      <BarraSuperior progreso={progreso} onPerfil={() => setPantalla('perfil')} />
      <MapaUnidades
        unidades={unidades}
        niveles={niveles}
        progreso={progreso}
        vencidos={vencidos}
        porId={porId}
        onUnidad={empezarUnidad}
        onRepaso={empezarRepaso}
        onExamen={empezarExamen}
        onSubirNivel={siguienteNivel(progreso.nivel) ? subirNivel : null}
      />
      <BarraTabs activa="mapa" onCambiar={setPantalla} />
    </div>
  )
}
