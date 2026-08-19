/**
 * Voz y sonidos.
 *
 * Sin archivos de audio: la voz sale de speechSynthesis (la del propio
 * dispositivo) y los pitidos de un oscilador. Así la app pesa lo mismo con
 * sonido que sin él y no hay que distribuir mp3 junto al build.
 */

let vozInglesa = null

function elegirVoz() {
  if (typeof speechSynthesis === 'undefined') return null
  const voces = speechSynthesis.getVoices()
  if (!voces.length) return null
  return (
    voces.find((v) => /en[-_]GB/i.test(v.lang)) ||
    voces.find((v) => /en[-_]US/i.test(v.lang)) ||
    voces.find((v) => /^en/i.test(v.lang)) ||
    null
  )
}

if (typeof speechSynthesis !== 'undefined') {
  vozInglesa = elegirVoz()
  // En Chrome la lista de voces llega de forma asíncrona.
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    vozInglesa = elegirVoz()
  })
}

export function hayVoz() {
  return typeof speechSynthesis !== 'undefined'
}

/** Lee un texto en inglés. `lento` para los ítems de dictado y pronunciación. */
export function hablar(texto, { lento = false } = {}) {
  if (!hayVoz() || !texto) return
  try {
    speechSynthesis.cancel()
    const frase = new SpeechSynthesisUtterance(texto)
    frase.lang = vozInglesa?.lang || 'en-US'
    if (vozInglesa) frase.voice = vozInglesa
    frase.rate = lento ? 0.65 : 0.92
    speechSynthesis.speak(frase)
  } catch { /* si el navegador se queja, seguimos sin voz */ }
}

let ctx = null
function contexto() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tono(frecuencia, duracion, inicio = 0, volumen = 0.08) {
  const c = contexto()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = frecuencia
  gain.gain.setValueAtTime(volumen, c.currentTime + inicio)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + duracion)
  osc.connect(gain).connect(c.destination)
  osc.start(c.currentTime + inicio)
  osc.stop(c.currentTime + inicio + duracion)
}

export function sonarAcierto() {
  tono(660, 0.12, 0)
  tono(880, 0.18, 0.09)
}

export function sonarFallo() {
  tono(220, 0.22, 0, 0.06)
}

export function vibrar(patron = 30) {
  try { navigator.vibrate?.(patron) } catch { /* iOS no vibra desde web */ }
}
