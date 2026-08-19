/**
 * Comprueba que TODOS los ítems del banco son resolubles desde la interfaz.
 * Ejecutar con:  npm run comprobar
 *
 * Es distinto de validar_banco.py, y complementario. El validador de Python
 * revisa el JSON: que la respuesta esté entre las opciones, que las fichas
 * formen la frase, que el índice del error apunte a donde debe. Este script
 * hace algo que aquel no puede: monta la respuesta correcta **con la forma
 * exacta que entrega cada componente de React** y se la pasa al motor.
 *
 * Es la diferencia entre «el ítem está bien escrito» y «el alumno puede
 * acertarlo». Un banco impecable en JSON puede seguir siendo injugable si el
 * componente y el validador no se entienden — que es justo el fallo que este
 * script descubrió la primera vez que se ejecutó: el banco de palabras entrega
 * objetos {id, texto} y el motor esperaba cadenas, así que todos los
 * ejercicios de ordenar y traducir se daban por fallados.
 *
 * Pásalo siempre después de generar o editar contenido.
 */

import { evaluar } from './src/motor/validar.js'
import banco from './src/data/banco.json' with { type: 'json' }

/** Reproduce lo que cada componente pone en `valor` cuando el alumno acierta. */
function respuestaDeLaInterfaz(item) {
  const comoFichas = (frase) =>
    frase.split(/\s+/).map((texto, i) => ({ id: `${i}-${texto}`, texto }))

  switch (item.tipo) {
    case 'opcion_multiple':
    case 'sonido_ed':
    case 'linea_tiempo':
    case 'completar':
    case 'transformar':
    case 'escuchar':
      return item.respuesta

    case 'ordenar':
      return comoFichas(item.respuesta)

    case 'traducir':
      // Con banco de palabras entrega fichas; sin él, texto libre.
      return item.fichas?.length ? comoFichas(item.respuesta) : item.respuesta

    case 'detectar_error':
      return item.indiceError

    case 'emparejar':
      return Object.fromEntries((item.pares || []).map((p) => [p.izquierda, p.derecha]))

    default:
      return null
  }
}

const rotos = []
for (const item of banco) {
  const resultado = evaluar(item, respuestaDeLaInterfaz(item))
  if (!resultado.correcta) rotos.push(item)
}

console.log(`${banco.length - rotos.length}/${banco.length} ítems resolubles desde la interfaz`)

if (rotos.length) {
  console.log(`\n✗ ${rotos.length} ítem(s) que el alumno NO puede acertar:`)
  for (const it of rotos) {
    console.log(`   • ${it.id} (${it.tipo}) — «${it.respuesta ?? '(sin respuesta)'}»`)
  }
  console.log('\nRevisa que `respuesta` coincida con lo que el componente entrega,')
  console.log('y que `aceptadas` incluya la respuesta modelo.')
  process.exit(1)
}

console.log('✓ Todos los ítems son jugables.')
