/**
 * Qué ítems entran en cada lección y en qué orden.
 *
 * Tres decisiones de diseño que conviene no romper sin querer:
 *  1. Lo vencido va primero: si no, el alumno solo avanza y nunca consolida.
 *  2. Orden ascendente de dificultad: entrar en calor antes de la parte que duele.
 *  3. Tipos intercalados: doce opciones múltiples seguidas matan una lección.
 */

import { vencido, hoyISO } from './srs.js'

export function barajar(lista, semilla = Math.random) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(semilla() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Con más coronas, la unidad se pone seria: primero desaparecen los ítems más
 * fáciles y al final las opciones múltiples, para que la tercera vuelta exija
 * producir la forma en lugar de reconocerla.
 */
function filtrarPorCorona(items, coronas) {
  if (coronas >= 3) {
    const duros = items.filter((it) => it.tipo !== 'opcion_multiple' && (it.nivel || 1) >= 2)
    if (duros.length >= 8) return duros
  }
  if (coronas === 2) {
    const medios = items.filter((it) => (it.nivel || 1) >= 2)
    if (medios.length >= 8) return medios
  }
  return items
}

/** Evita dos ítems del mismo tipo seguidos. `previo` encadena con la banda anterior. */
function intercalarTipos(items, previo = null) {
  const resultado = []
  const pendientes = [...items]
  let anterior = previo
  while (pendientes.length) {
    let idx = pendientes.findIndex((it) => !anterior || it.tipo !== anterior.tipo)
    if (idx === -1) idx = 0 // no queda alternativa: se acepta la repetición
    anterior = pendientes.splice(idx, 1)[0]
    resultado.push(anterior)
  }
  return resultado
}

/**
 * Dificultad ascendente y tipos intercalados a la vez.
 *
 * Los dos criterios chocan: buscar un tipo distinto puede adelantar un ítem
 * más difícil. Se resuelve intercalando *dentro* de cada banda de nivel, nunca
 * entre bandas, así el alumno entra en calor y aun así no ve doce opciones
 * múltiples seguidas.
 */
function ordenarLeccion(items) {
  const resultado = []
  for (const nivel of [1, 2, 3]) {
    const banda = items.filter((it) => (it.nivel || 1) === nivel)
    resultado.push(...intercalarTipos(banda, resultado[resultado.length - 1]))
  }
  const colocados = new Set(resultado.map((it) => it.id))
  resultado.push(...items.filter((it) => !colocados.has(it.id)))
  return resultado
}

/**
 * Lección de una unidad. Prioriza: vencidos → nunca vistos → menos vistos.
 * Así cada pasada por la unidad enseña frases nuevas en lugar de repetir las
 * mismas cinco, que es lo que hace que un alumno abandone en la segunda sesión.
 */
export function construirLeccion({ banco, unidadId, progreso, tamano = 11, coronas = 0 }) {
  const hoy = hoyISO()
  const deLaUnidad = filtrarPorCorona(
    banco.filter((it) => it.unidad === unidadId),
    coronas
  )

  const estado = (it) => progreso.items[it.id]
  const vencidos = deLaUnidad.filter((it) => estado(it) && vencido(estado(it), hoy))
  const nuevos = deLaUnidad.filter((it) => !estado(it))
  const resto = deLaUnidad
    .filter((it) => estado(it) && !vencido(estado(it), hoy))
    .sort((a, b) => (estado(a).vistas || 0) - (estado(b).vistas || 0))

  const elegidos = [
    ...barajar(vencidos),
    ...barajar(nuevos),
    ...resto,
  ].slice(0, tamano)

  return ordenarLeccion(elegidos)
}

/** Sesión de repaso: solo lo vencido, de cualquier unidad. */
export function construirRepaso({ banco, progreso, tamano = 12 }) {
  const hoy = hoyISO()
  const vencidos = banco.filter((it) => {
    const e = progreso.items[it.id]
    return e && vencido(e, hoy)
  })
  return ordenarLeccion(barajar(vencidos).slice(0, tamano))
}

/** Práctica dirigida a las reglas que el alumno lleva peor. */
export function construirPractica({ banco, reglas, tamano = 10 }) {
  const objetivo = new Set(reglas)
  const candidatos = banco.filter((it) => objetivo.has(it.regla))
  return ordenarLeccion(barajar(candidatos).slice(0, tamano))
}

/**
 * Prueba de clasificación: cinco ítems por banda del Marco (A1, A2, B1).
 *
 * Cinco y no tres porque con tan pocos ítems una racha de suerte desplaza al
 * alumno de banda entera. Se prefieren los de nivel 2 y 3 (producir y decidir):
 * reconocer entre cuatro opciones se acierta demasiado por descarte, y eso
 * clasificaría de más.
 */
export function construirPrueba({ banco, unidades, porBanda = 5 }) {
  const nivelDe = new Map(unidades.map((u) => [u.id, u.nivel]))
  const seleccion = []

  for (const banda of ['A1', 'A2', 'B1']) {
    const candidatos = banco.filter((it) => nivelDe.get(it.unidad) === banda)
    const exigentes = candidatos.filter((it) => (it.nivel || 1) >= 2)
    const pool = exigentes.length >= porBanda ? exigentes : candidatos
    seleccion.push(...barajar(pool).slice(0, porBanda))
  }

  // Sin reordenar por dificultad: la prueba va de banda fácil a banda difícil,
  // que es justo lo que se está midiendo.
  return seleccion
}

/** Examen de diagnóstico: reparte por unidades y prioriza nivel 3. */
export function construirExamen({ banco, tamano = 20 }) {
  const porUnidad = new Map()
  for (const it of banco) {
    if (!porUnidad.has(it.unidad)) porUnidad.set(it.unidad, [])
    porUnidad.get(it.unidad).push(it)
  }
  const seleccion = []
  const unidades = [...porUnidad.keys()]
  let vuelta = 0
  while (seleccion.length < tamano && vuelta < 10) {
    for (const u of unidades) {
      const pool = porUnidad.get(u)
      if (pool[vuelta]) seleccion.push(pool[vuelta])
      if (seleccion.length >= tamano) break
    }
    vuelta++
  }
  return barajar(seleccion)
}
