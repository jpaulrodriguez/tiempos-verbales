/**
 * Repaso espaciado (Leitner de 5 cajas).
 *
 * Acertar sube de caja y aleja el próximo repaso; fallar devuelve a la caja 0,
 * donde el ítem vuelve el mismo día. Ver references/diseno-pedagogico.md.
 */

export const INTERVALOS_DIAS = [0, 1, 3, 7, 21]

export function hoyISO(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10)
}

function sumarDias(iso, dias) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + dias)
  return hoyISO(d)
}

/** Estado inicial de un ítem que el alumno nunca ha visto. */
export function estadoNuevo() {
  return { caja: 0, proximo: hoyISO(), vistas: 0 }
}

/** ¿Toca repasar este ítem hoy? Los no vistos nunca están "vencidos". */
export function vencido(estado, hoy = hoyISO()) {
  if (!estado) return false
  return estado.proximo <= hoy
}

/** Aplica el resultado de una respuesta al estado SRS del ítem. */
export function actualizar(estado, acierto, hoy = hoyISO()) {
  const base = estado || estadoNuevo()
  const caja = acierto
    ? Math.min(base.caja + 1, INTERVALOS_DIAS.length - 1)
    : 0
  return {
    caja,
    proximo: sumarDias(hoy, INTERVALOS_DIAS[caja]),
    vistas: (base.vistas || 0) + 1,
  }
}

/** Cuántos ítems del banco están vencidos hoy. Alimenta el botón "Repaso". */
export function contarVencidos(banco, estados, hoy = hoyISO()) {
  return banco.filter((it) => estados[it.id] && vencido(estados[it.id], hoy)).length
}
