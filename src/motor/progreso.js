/**
 * Progreso del alumno, persistido en localStorage.
 *
 * Un alumno, un dispositivo, sin cuentas ni servidor. Si algún día hace falta
 * seguimiento de clase, esto se sustituye por una API; el resto de la app no
 * se entera porque solo habla con las funciones de este módulo.
 */

import { hoyISO, actualizar as actualizarSRS } from './srs.js'

const CLAVE = 'tiempos-verbales:progreso:v1'

export const CORAZONES_MAX = 5

/**
 * Niveles del Marco Común Europeo, ordenados.
 *
 * Ojo con no confundirlos con el campo `nivel` de los ítems, que es otra cosa:
 * aquel mide la dificultad de la TAREA (1 reconocer · 2 producir · 3 decidir) y
 * este mide el punto del temario donde está el alumno. Un ítem de nivel 3 puede
 * ser perfectamente A1 — «elige entre works y is working» es difícil de resolver
 * pero pertenece al primer bloque del curso.
 */
export const NIVELES = ['A1', 'A2', 'B1']

export function rangoNivel(nivel) {
  const i = NIVELES.indexOf(nivel)
  return i === -1 ? 0 : i
}

export function progresoInicial() {
  return {
    version: 2,
    nivel: null,  // A1 · A2 · B1. Nulo hasta que el alumno lo elige al entrar.
    xp: 0,
    racha: 0,
    ultimoDia: null,
    corazones: CORAZONES_MAX,
    unidades: {}, // id -> { coronas, mejorPorcentaje, completada }
    items: {},    // id -> estado SRS
    reglas: {},   // id -> { aciertos, intentos }
    lecciones: 0,
  }
}

export function cargar() {
  try {
    const bruto = localStorage.getItem(CLAVE)
    if (!bruto) return progresoInicial()
    const datos = { ...progresoInicial(), ...JSON.parse(bruto) }

    // Migración desde antes de que existieran los niveles: a quien ya llevaba
    // lecciones hechas se le deja todo abierto, como lo tenía. Interrumpirle a
    // mitad de curso con una pantalla de bienvenida sería un mal recibimiento.
    if (!datos.nivel && datos.lecciones > 0) datos.nivel = 'B1'

    return datos
  } catch {
    // Un localStorage corrupto no debe dejar al alumno con la app en blanco.
    return progresoInicial()
  }
}

export function guardar(progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(progreso))
  } catch {
    /* modo incógnito o cuota llena: se juega igual, solo no se guarda */
  }
}

export function reiniciar() {
  try {
    localStorage.removeItem(CLAVE)
  } catch { /* nada que hacer */ }
  return progresoInicial()
}

/**
 * Actualiza la racha diaria al abrir la app.
 * Un día seguido la mantiene; saltarse un día la rompe. El listón es bajo a
 * propósito: la racha sostiene el hábito solo si es alcanzable un martes malo.
 */
export function revisarRacha(progreso, hoy = hoyISO()) {
  if (progreso.ultimoDia === hoy) return progreso
  const ayer = new Date(hoy + 'T00:00:00')
  ayer.setDate(ayer.getDate() - 1)
  const ayerISO = hoyISO(ayer)
  const sigueViva = progreso.ultimoDia === ayerISO
  return {
    ...progreso,
    racha: sigueViva ? progreso.racha : 0,
    corazones: CORAZONES_MAX, // los corazones se recargan cada día
  }
}

/** Registra una respuesta: SRS del ítem + estadística de la regla. */
export function registrarRespuesta(progreso, item, acierto) {
  const reglaId = item.regla || item.unidad || 'general'
  const regla = progreso.reglas[reglaId] || { aciertos: 0, intentos: 0 }
  return {
    ...progreso,
    items: {
      ...progreso.items,
      [item.id]: actualizarSRS(progreso.items[item.id], acierto),
    },
    reglas: {
      ...progreso.reglas,
      [reglaId]: {
        aciertos: regla.aciertos + (acierto ? 1 : 0),
        intentos: regla.intentos + 1,
      },
    },
  }
}

/** Cierra una lección: XP, racha, coronas y desbloqueo. */
export function registrarLeccion(progreso, { unidadId, aciertos, total, hoy = hoyISO() }) {
  const porcentaje = total ? Math.round((aciertos / total) * 100) : 0
  const perfecta = aciertos === total && total > 0
  const xpGanado = 10 + (perfecta ? 5 : 0) + Math.floor(aciertos / 5) * 2

  const previa = progreso.unidades[unidadId] || { coronas: 0, mejorPorcentaje: 0 }
  const superada = porcentaje >= 80
  const unidad = {
    coronas: superada ? Math.min(previa.coronas + 1, 3) : previa.coronas,
    mejorPorcentaje: Math.max(previa.mejorPorcentaje, porcentaje),
    completada: previa.completada || superada,
  }

  const nuevoDia = progreso.ultimoDia !== hoy

  return {
    ...progreso,
    xp: progreso.xp + xpGanado,
    racha: nuevoDia ? progreso.racha + 1 : progreso.racha,
    ultimoDia: hoy,
    lecciones: progreso.lecciones + 1,
    unidades: { ...progreso.unidades, [unidadId]: unidad },
    xpUltimaLeccion: xpGanado,
  }
}

export function perderCorazon(progreso) {
  return { ...progreso, corazones: Math.max(0, progreso.corazones - 1) }
}

export function recuperarCorazones(progreso, cantidad = 2) {
  return { ...progreso, corazones: Math.min(CORAZONES_MAX, progreso.corazones + cantidad) }
}

export function gastarXP(progreso, cantidad) {
  return { ...progreso, xp: Math.max(0, progreso.xp - cantidad) }
}

export function fijarNivel(progreso, nivel) {
  return { ...progreso, nivel: NIVELES.includes(nivel) ? nivel : 'A1' }
}

/**
 * ¿Está desbloqueada esta unidad?
 *
 * Dos puertas, y hay que pasar las dos:
 *
 *  1. El nivel. Lo que está por encima del nivel declarado no se abre. Se sube
 *     de nivel desde el perfil, o aceptando el ofrecimiento cuando terminas el
 *     tuyo. Es una decisión del alumno, no un premio escondido.
 *
 *  2. Los prerrequisitos. Con un matiz importante: los que quedan por debajo de
 *     tu nivel cuentan como superados aunque no los hayas hecho. Sin eso, quien
 *     entra en A2 tendría que fabricarse las siete unidades de A1 antes de ver
 *     su primera lección, que es exactamente la fricción que hace abandonar.
 *
 * `porId` es un Map de id → unidad, necesario para saber el nivel de cada
 * prerrequisito. Si no se pasa, se cae al comportamiento clásico (todos los
 * prerrequisitos hay que completarlos).
 */
export function desbloqueada(unidad, progreso, porId = null) {
  const delAlumno = rangoNivel(progreso.nivel)
  if (rangoNivel(unidad.nivel) > delAlumno) return false

  return (unidad.requiere || []).every((id) => {
    if (progreso.unidades[id]?.completada) return true
    const previa = porId?.get(id)
    return previa ? rangoNivel(previa.nivel) < delAlumno : false
  })
}

/** ¿Ha terminado el alumno todas las unidades de su nivel? */
export function nivelTerminado(unidades, progreso) {
  const suyas = unidades.filter((u) => u.nivel === progreso.nivel)
  return suyas.length > 0 && suyas.every((u) => progreso.unidades[u.id]?.completada)
}

export function siguienteNivel(nivel) {
  return NIVELES[rangoNivel(nivel) + 1] || null
}

/**
 * Nivel que sugiere la prueba de clasificación.
 *
 * La regla es «tu nivel es la primera banda que aún no dominas», porque el
 * nivel marca dónde tienes que estudiar, no lo que ya sabes. Dominar A1 y
 * fallar A2 significa que te toca A2, no que seas A1.
 */
export function nivelSegunPrueba(porNivel, umbral = 0.6) {
  const domina = (n) => {
    const banda = porNivel[n]
    return banda && banda.total > 0 && banda.aciertos / banda.total >= umbral
  }
  if (!domina('A1')) return 'A1'
  if (!domina('A2')) return 'A2'
  return 'B1'
}

/**
 * Las reglas donde peor va el alumno, para la pantalla de perfil.
 * Se exige un mínimo de intentos: con 1 de 1 fallado no se puede concluir nada.
 */
export function puntosDebiles(progreso, { minimoIntentos = 3, cuantas = 3 } = {}) {
  return Object.entries(progreso.reglas)
    .filter(([, r]) => r.intentos >= minimoIntentos)
    .map(([id, r]) => ({ id, ...r, tasa: r.aciertos / r.intentos }))
    .filter((r) => r.tasa < 0.8)
    .sort((a, b) => a.tasa - b.tasa)
    .slice(0, cuantas)
}
