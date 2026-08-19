/**
 * Pruebas del motor. Ejecutar con:  npm run prueba
 *
 * Usan ítems de prueba propios, no el banco de contenido, para que sigan
 * valiendo cuando se sustituya banco.json por otro temario. Si tocas
 * validar.js, srs.js, progreso.js o seleccion.js, pasa esto antes de dar la
 * app por buena: un fallo aquí se traduce en corazones perdidos por bugs.
 */

import { evaluar, normalizar, hayRespuesta, textoEsperado } from './src/motor/validar.js'
import { construirLeccion, construirRepaso, construirExamen, construirPractica, construirPrueba } from './src/motor/seleccion.js'
import { actualizar, estadoNuevo, vencido, hoyISO, contarVencidos } from './src/motor/srs.js'
import {
  progresoInicial, registrarRespuesta, registrarLeccion, revisarRacha,
  puntosDebiles, desbloqueada, perderCorazon, recuperarCorazones, CORAZONES_MAX,
  rangoNivel, fijarNivel, nivelSegunPrueba, siguienteNivel, nivelTerminado,
} from './src/motor/progreso.js'

let ok = 0
const fallos = []
const t = (nombre, cond) => (cond ? ok++ : fallos.push(nombre))
const grupo = (n) => console.log(`— ${n} —`)

// ── Fixtures ────────────────────────────────────────────────────────────────
const F = {
  om: { id: 'f1', tipo: 'opcion_multiple', unidad: 'u1', regla: 'orto-ies', nivel: 1,
        enunciado: 'She ___ hard.', opciones: ['studies', 'studys', 'study'], respuesta: 'studies', explicacion: 'x' },
  comp: { id: 'f2', tipo: 'completar', unidad: 'u1', regla: 'orto-es', nivel: 2,
          enunciado: 'He ___ home.', respuesta: 'goes', aceptadas: ['goes'], explicacion: 'x' },
  trans: { id: 'f3', tipo: 'transformar', unidad: 'u2', regla: 'aux-do', nivel: 2,
           enunciado: 'She speaks English.', transformacion: 'negativa',
           respuesta: "She doesn't speak English.", aceptadas: ["She doesn't speak English.", 'She does not speak English.'], explicacion: 'x' },
  ord: { id: 'f4', tipo: 'ordenar', unidad: 'u2', regla: 'orden-pregunta', nivel: 2,
         fichas: ['does', 'Where', 'she', 'live', '?'], respuesta: 'Where does she live ?', explicacion: 'x' },
  err: { id: 'f5', tipo: 'detectar_error', unidad: 'u2', regla: 'stative', nivel: 3,
         enunciado: 'I am knowing the answer.', indiceError: 2, correccion: 'know', explicacion: 'x' },
  emp: { id: 'f6', tipo: 'emparejar', unidad: 'u3', regla: 'marcadores', nivel: 1,
         pares: [{ izquierda: 'a', derecha: 'A' }, { izquierda: 'b', derecha: 'B' }], explicacion: 'x' },
  son: { id: 'f7', tipo: 'sonido_ed', unidad: 'u3', regla: 'ed-t', nivel: 1,
         palabra: 'laughed', respuesta: '/t/', explicacion: 'x' },
  lin: { id: 'f8', tipo: 'linea_tiempo', unidad: 'u3', regla: 'marcadores', nivel: 1,
         enunciado: 'I went home.', zonas: ['Pasado', 'Ahora', 'Futuro'], respuesta: 'Pasado', explicacion: 'x' },
  preg: { id: 'f9', tipo: 'transformar', unidad: 'u2', regla: 'orden-pregunta', nivel: 2,
          enunciado: 'They have finished.', transformacion: 'pregunta_yn',
          respuesta: 'Have they finished?', aceptadas: ['Have they finished?'], explicacion: 'x' },
  trad: { id: 'f10', tipo: 'traducir', unidad: 'u3', regla: 'aux-have', nivel: 3,
          enunciado: 'Ella no lo ha terminado todavía.',
          respuesta: "She hasn't finished it yet.",
          aceptadas: ["She hasn't finished it yet.", 'She has not finished it yet.'],
          fichas: ['She', "hasn't", 'finished', 'it', 'yet', '.'], explicacion: 'x' },
}
const BANCO = Object.values(F)

// ── validar.js ──────────────────────────────────────────────────────────────
grupo('validar.js')
t('acierta la opción correcta', evaluar(F.om, 'studies').correcta)
t('rechaza el distractor', !evaluar(F.om, 'studys').correcta)
t('sin respuesta no acierta', !evaluar(F.om, null).correcta)
t('ignora mayúsculas', evaluar(F.comp, 'GOES').correcta)
t('ignora espacios sobrantes', evaluar(F.comp, '  goes  ').correcta)
t('en ortografía NO perdona erratas', !evaluar(F.comp, 'gose').correcta)
t('acepta la forma contraída', evaluar(F.trans, "She doesn't speak English.").correcta)
t('acepta la forma completa', evaluar(F.trans, 'She does not speak English').correcta)
t('perdona una errata fuera de ortografía', evaluar(F.trans, 'She does not speak Englsh').casi)
t('no perdona dos erratas', !evaluar(F.trans, 'She dos not speek English').correcta)
t('unifica el apóstrofo tipográfico', evaluar(F.trans, 'She doesn’t speak English.').correcta)
t('el punto final es opcional', normalizar('Hello there.') === normalizar('Hello there'))
t('la interrogación sí cuenta', !evaluar(F.preg, 'They have finished.').correcta)
t('pregunta bien formada', evaluar(F.preg, 'Have they finished?').correcta)
t('ordenar acepta el orden bueno', evaluar(F.ord, ['Where', 'does', 'she', 'live', '?']).correcta)
t('ordenar rechaza el orden malo', !evaluar(F.ord, ['Does', 'where', 'she', 'live', '?']).correcta)
// Fichas.jsx entrega objetos {id, texto}, no cadenas. Si esto se rompe, TODOS
// los ejercicios de banco de palabras se dan por fallados pase lo que pase.
const comoFichas = (frase) => frase.split(' ').map((texto, i) => ({ id: `${i}-${texto}`, texto }))
t('ordenar acepta fichas como objetos', evaluar(F.ord, comoFichas('Where does she live ?')).correcta)
t('ordenar rechaza fichas mal ordenadas', !evaluar(F.ord, comoFichas('Does where she live ?')).correcta)
t('traducir acepta fichas como objetos', evaluar(F.trad, comoFichas("She hasn't finished it yet .")).correcta)
t('detectar_error acierta el índice', evaluar(F.err, 2).correcta)
t('detectar_error rechaza otro índice', !evaluar(F.err, 1).correcta)
t('emparejar completo y correcto', evaluar(F.emp, { a: 'A', b: 'B' }).correcta)
t('emparejar cruzado falla', !evaluar(F.emp, { a: 'B', b: 'A' }).correcta)
t('emparejar incompleto falla', !evaluar(F.emp, { a: 'A' }).correcta)
t('sonido_ed', evaluar(F.son, '/t/').correcta && !evaluar(F.son, '/d/').correcta)
t('linea_tiempo', evaluar(F.lin, 'Pasado').correcta)
t('tipo desconocido no revienta', !evaluar({ tipo: 'inventado' }, 'x').correcta)
t('hayRespuesta con vacío', !hayRespuesta(F.om, null) && !hayRespuesta(F.comp, '   '))
t('hayRespuesta con valor', hayRespuesta(F.om, 'studies') && hayRespuesta(F.err, 0))
t('textoEsperado en detectar_error', textoEsperado(F.err).includes('know'))
t('textoEsperado en emparejar', textoEsperado(F.emp).includes('a → A'))

// ── srs.js ──────────────────────────────────────────────────────────────────
grupo('srs.js')
let e = estadoNuevo()
t('un ítem nuevo vence hoy', vencido(e))
e = actualizar(e, true)
t('acertar sube a la caja 1', e.caja === 1)
t('la caja 1 aplaza a mañana', !vencido(e))
e = actualizar(e, true)
t('acertar sube a la caja 2', e.caja === 2)
e = actualizar(e, false)
t('fallar devuelve a la caja 0', e.caja === 0)
t('la caja 0 vuelve hoy mismo', vencido(e))
t('las vistas se acumulan', e.vistas === 3)
let tope = estadoNuevo()
for (let i = 0; i < 10; i++) tope = actualizar(tope, true)
t('la caja no se pasa del tope', tope.caja === 4)
t('contarVencidos ignora los no vistos', contarVencidos(BANCO, {}) === 0)

// ── progreso.js ─────────────────────────────────────────────────────────────
grupo('progreso.js')
let p = progresoInicial()
p = registrarRespuesta(p, F.om, false)
p = registrarRespuesta(p, F.om, false)
p = registrarRespuesta(p, F.om, true)
t('la regla acumula 1 de 3', p.reglas['orto-ies'].aciertos === 1 && p.reglas['orto-ies'].intentos === 3)
t('detecta el punto débil', puntosDebiles(p).some((r) => r.id === 'orto-ies'))
t('no concluye con pocos intentos', puntosDebiles(registrarRespuesta(progresoInicial(), F.om, false)).length === 0)
p = registrarLeccion(p, { unidadId: 'u1', aciertos: 10, total: 11 })
t('un 90% otorga corona', p.unidades.u1.coronas === 1)
t('la unidad queda completada', p.unidades.u1.completada)
t('el XP se suma', p.xp === 10 + Math.floor(10 / 5) * 2)
t('la racha arranca en 1', p.racha === 1)
const flojo = registrarLeccion(progresoInicial(), { unidadId: 'u1', aciertos: 5, total: 11 })
t('un 45% no otorga corona', flojo.unidades.u1.coronas === 0)
t('las coronas no pasan de 3', [1, 2, 3, 4].reduce((q) => registrarLeccion(q, { unidadId: 'u1', aciertos: 11, total: 11 }), progresoInicial()).unidades.u1.coronas === 3)
t('desbloquea con el prerrequisito hecho', desbloqueada({ id: 'u2', requiere: ['u1'] }, p))
t('mantiene cerrado sin prerrequisito', !desbloqueada({ id: 'u9', requiere: ['uX'] }, p))
t('sin prerrequisitos siempre abierta', desbloqueada({ id: 'u1', requiere: [] }, progresoInicial()))
t('la racha se rompe tras faltar un día', revisarRacha({ ...p, ultimoDia: '2020-01-01' }).racha === 0)
t('la racha sigue viva si jugó ayer', revisarRacha({ ...p, racha: 5, ultimoDia: hoyISO(new Date(Date.now() - 864e5)) }).racha === 5)
t('los corazones se recargan cada día', revisarRacha({ ...p, corazones: 0, ultimoDia: '2020-01-01' }).corazones === CORAZONES_MAX)
t('los corazones no bajan de 0', perderCorazon({ corazones: 0 }).corazones === 0)
t('los corazones no pasan del máximo', recuperarCorazones({ corazones: 5 }, 2).corazones === CORAZONES_MAX)

// ── seleccion.js ────────────────────────────────────────────────────────────
grupo('seleccion.js')
const lec = construirLeccion({ banco: BANCO, unidadId: 'u2', progreso: progresoInicial() })
t('la lección no sale vacía', lec.length > 0)
t('solo trae ítems de la unidad', lec.every((i) => i.unidad === 'u2'))
t('ordena por dificultad ascendente', lec.every((it, i) => i === 0 || (it.nivel || 1) >= (lec[i - 1].nivel || 1)))
t('no repite ítems dentro de la lección', new Set(lec.map((i) => i.id)).size === lec.length)
t('unidad inexistente devuelve vacío', construirLeccion({ banco: BANCO, unidadId: 'nope', progreso: progresoInicial() }).length === 0)
const tras = registrarRespuesta(progresoInicial(), F.om, false)
t('el repaso recoge lo recién fallado', construirRepaso({ banco: BANCO, progreso: tras }).some((i) => i.id === F.om.id))
t('el repaso ignora lo acertado hoy', !construirRepaso({ banco: BANCO, progreso: registrarRespuesta(progresoInicial(), F.om, true) }).some((i) => i.id === F.om.id))
t('la práctica filtra por regla', construirPractica({ banco: BANCO, reglas: ['stative'] }).every((i) => i.regla === 'stative'))
t('el examen reparte entre unidades', new Set(construirExamen({ banco: BANCO, tamano: 9 }).map((i) => i.unidad)).size === 3)
t('el examen respeta el tamaño', construirExamen({ banco: BANCO, tamano: 4 }).length === 4)

// ── Niveles del Marco ───────────────────────────────────────────────────────
grupo('niveles MCER')
const UNIS = [
  { id: 'a1a', nivel: 'A1', requiere: [] },
  { id: 'a1b', nivel: 'A1', requiere: ['a1a'] },
  { id: 'a2a', nivel: 'A2', requiere: ['a1b'] },
  { id: 'a2b', nivel: 'A2', requiere: ['a2a'] },
  { id: 'b1a', nivel: 'B1', requiere: ['a2b'] },
]
const MAPA = new Map(UNIS.map((u) => [u.id, u]))
const uni = (id) => UNIS.find((u) => u.id === id)
const conNivel = (n, unidades = {}) => ({ ...progresoInicial(), nivel: n, unidades })

t('el orden de los niveles', rangoNivel('A1') === 0 && rangoNivel('A2') === 1 && rangoNivel('B1') === 2)
t('un nivel desconocido cae en A1', rangoNivel('C2') === 0 && rangoNivel(null) === 0)
t('fijarNivel rechaza lo inválido', fijarNivel(progresoInicial(), 'Z9').nivel === 'A1')
t('siguienteNivel encadena', siguienteNivel('A1') === 'A2' && siguienteNivel('A2') === 'B1')
t('B1 no tiene siguiente', siguienteNivel('B1') === null)

t('lo que está por encima del nivel se cierra', !desbloqueada(uni('b1a'), conNivel('A2'), MAPA))
t('la primera unidad de tu nivel se abre', desbloqueada(uni('a2a'), conNivel('A2'), MAPA))
t('los prerrequisitos de niveles previos no frenan', desbloqueada(uni('a2a'), conNivel('A2', {}), MAPA))
t('dentro del nivel sí hay cadena', !desbloqueada(uni('a2b'), conNivel('A2'), MAPA))
t('la cadena avanza al completar', desbloqueada(uni('a2b'), conNivel('A2', { a2a: { completada: true } }), MAPA))
t('lo de niveles inferiores queda abierto', desbloqueada(uni('a1b'), conNivel('B1'), MAPA))
t('en tu propio nivel la cadena manda', !desbloqueada(uni('a1b'), conNivel('A1'), MAPA))
t('sin el mapa se cae al comportamiento clásico', !desbloqueada(uni('a2a'), conNivel('A2')))

t('nivelTerminado detecta el final', nivelTerminado(UNIS, conNivel('A1', { a1a: { completada: true }, a1b: { completada: true } })))
t('nivelTerminado con una a medias', !nivelTerminado(UNIS, conNivel('A1', { a1a: { completada: true } })))

const banda = (a, tot) => ({ aciertos: a, total: tot })
t('falla A1 → A1', nivelSegunPrueba({ A1: banda(1, 5), A2: banda(5, 5), B1: banda(5, 5) }) === 'A1')
t('domina A1, falla A2 → A2', nivelSegunPrueba({ A1: banda(5, 5), A2: banda(1, 5), B1: banda(0, 5) }) === 'A2')
t('domina A1 y A2 → B1', nivelSegunPrueba({ A1: banda(4, 5), A2: banda(3, 5), B1: banda(0, 5) }) === 'B1')
t('justo en el umbral (3 de 5) cuenta', nivelSegunPrueba({ A1: banda(3, 5), A2: banda(2, 5), B1: banda(0, 5) }) === 'A2')
t('una banda vacía no promociona', nivelSegunPrueba({ A1: banda(0, 0), A2: banda(5, 5), B1: banda(5, 5) }) === 'A1')

// Banco holgado: cada unidad aporta 4 ítems de nivel 2-3, de sobra para que
// las tres bandas puedan servirse solo de los exigentes.
const BANCO_NIV = UNIS.flatMap((u) =>
  Array.from({ length: 6 }, (_, i) => ({ ...F.om, id: `${u.id}-${i}`, unidad: u.id, nivel: (i % 3) + 1 }))
)
const prueba = construirPrueba({ banco: BANCO_NIV, unidades: UNIS })
const cuenta = (lista, n) => lista.filter((it) => MAPA.get(it.unidad).nivel === n).length
t('la prueba trae 5 por banda', prueba.length === 15)
t('reparto equilibrado entre bandas', cuenta(prueba, 'A1') === 5 && cuenta(prueba, 'A2') === 5)
t('la prueba no repite ítems', new Set(prueba.map((i) => i.id)).size === 15)
t('prefiere producir y decidir donde hay de sobra',
  prueba.filter((it) => MAPA.get(it.unidad).nivel === 'A1').every((it) => it.nivel >= 2))

// Banda escasa: B1 con solo tres ítems exigentes. Vale más completar la banda
// con uno fácil que devolverla corta, porque una banda corta desvía el cálculo
// del nivel: menos preguntas, más peso por acierto.
const BANCO_POBRE = [
  ...BANCO_NIV.filter((it) => MAPA.get(it.unidad).nivel !== 'B1'),
  ...Array.from({ length: 5 }, (_, i) => ({ ...F.om, id: `pobre-${i}`, unidad: 'b1a', nivel: i < 3 ? 3 : 1 })),
]
const pruebaPobre = construirPrueba({ banco: BANCO_POBRE, unidades: UNIS })
t('completa la banda escasa en vez de acortarla', cuenta(pruebaPobre, 'B1') === 5)
t('y las bandas holgadas no se resienten', pruebaPobre.length === 15)

// ── Resultado ───────────────────────────────────────────────────────────────
console.log()
if (fallos.length) {
  console.log(`✗ ${fallos.length} fallo(s) de ${ok + fallos.length}:`)
  fallos.forEach((f) => console.log(`   • ${f}`))
  process.exit(1)
}
console.log(`✓ ${ok} pruebas pasan.`)
