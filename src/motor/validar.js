/**
 * Validación de respuestas.
 *
 * Toda la lógica de "¿acertó?" vive aquí, separada de los componentes, porque
 * es la parte que más se ajusta con el uso real (aparece una variante válida que
 * no habíamos previsto) y conviene poder tocarla en un solo sitio.
 */

/**
 * Normaliza para comparar: minúsculas, apóstrofos tipográficos unificados,
 * espacios colapsados y punto final opcional.
 *
 * El punto final se ignora a propósito (nadie aprende inglés por olvidarlo),
 * pero los signos ? y ! sí cuentan: distinguir afirmación de pregunta es
 * justamente lo que estamos enseñando en los ítems de estructura.
 */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .replace(/[‘’ʼ´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s*([?!,;:])\s*/g, '$1 ')
    .replace(/\s*\.\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Distancia de Levenshtein, para tolerar una errata suelta al escribir. */
export function distancia(a, b) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 2) return 99
  let fila = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let anterior = fila[0]
    fila[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = fila[j]
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        anterior + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      anterior = temp
    }
  }
  return fila[b.length]
}

/**
 * ¿Se le perdona una errata a este ítem?
 *
 * En un ítem de ortografía, la errata *es* el error que estamos midiendo:
 * perdonar "studys" cuando la unidad va de -ies vaciaría el ejercicio. En los
 * demás, una letra bailada no debería costar un corazón.
 */
function toleraErratas(item) {
  if (item.estricto) return false
  const regla = String(item.regla || '')
  return !regla.startsWith('orto') && !regla.startsWith('ed-')
}

function respuestasValidas(item) {
  const lista = item.aceptadas?.length ? item.aceptadas : [item.respuesta]
  return lista.filter(Boolean).map(normalizar)
}

/**
 * Convierte lo que entrega el componente en una cadena comparable.
 *
 * El banco de palabras (Fichas.jsx) entrega objetos {id, texto} y no cadenas,
 * porque necesita distinguir dos fichas con la misma palabra para poder
 * quitarlas por separado. Sin este aplanado, un join() daría "[object Object]"
 * y TODOS los ejercicios de ordenar y traducir con fichas se darían por
 * fallados hiciera lo que hiciera el alumno.
 */
function aTexto(valor) {
  if (Array.isArray(valor)) {
    return valor.map((v) => (v && typeof v === 'object' ? v.texto ?? '' : v)).join(' ')
  }
  return valor
}

/**
 * Evalúa una respuesta.
 * @returns {{correcta: boolean, casi: boolean, esperado: string}}
 *   `casi` = correcta salvo por una errata; la lección lo da por bueno pero
 *   avisa, para que el alumno vea la forma bien escrita.
 */
export function evaluar(item, valor) {
  const esperado = item.respuesta ?? ''
  const fallo = { correcta: false, casi: false, esperado }

  switch (item.tipo) {
    case 'opcion_multiple':
    case 'sonido_ed':
    case 'linea_tiempo': {
      if (valor == null) return fallo
      return { correcta: normalizar(valor) === normalizar(esperado), casi: false, esperado }
    }

    case 'completar':
    case 'traducir':
    case 'transformar':
    case 'escuchar': {
      const dado = normalizar(aTexto(valor))
      if (!dado) return fallo
      const validas = respuestasValidas(item)
      if (validas.includes(dado)) return { correcta: true, casi: false, esperado }
      if (toleraErratas(item) && validas.some((v) => distancia(dado, v) <= 1)) {
        return { correcta: true, casi: true, esperado }
      }
      return fallo
    }

    case 'ordenar': {
      const dado = normalizar(aTexto(valor))
      if (!dado) return fallo
      return { correcta: respuestasValidas(item).includes(dado), casi: false, esperado }
    }

    case 'detectar_error': {
      if (valor == null) return fallo
      return { correcta: Number(valor) === Number(item.indiceError), casi: false, esperado }
    }

    case 'emparejar': {
      const hechos = valor || {}
      const pares = item.pares || []
      const completo = Object.keys(hechos).length === pares.length
      const bien = pares.every((p) => hechos[p.izquierda] === p.derecha)
      return { correcta: completo && bien, casi: false, esperado }
    }

    default:
      return fallo
  }
}

/** ¿Hay respuesta suficiente para habilitar el botón COMPROBAR? */
export function hayRespuesta(item, valor) {
  if (item.tipo === 'emparejar') {
    return Object.keys(valor || {}).length === (item.pares || []).length
  }
  if (item.tipo === 'detectar_error') return valor != null
  if (Array.isArray(valor)) return valor.length > 0
  return String(valor ?? '').trim().length > 0
}

/** Texto legible de la respuesta correcta, para el panel de feedback. */
export function textoEsperado(item) {
  switch (item.tipo) {
    case 'detectar_error': {
      const palabras = (item.enunciado || '').split(/\s+/)
      const mal = palabras[item.indiceError] ?? ''
      return item.correccion ? `${mal} → ${item.correccion}` : mal
    }
    case 'emparejar':
      return (item.pares || []).map((p) => `${p.izquierda} → ${p.derecha}`).join(' · ')
    default:
      return item.respuesta ?? ''
  }
}
