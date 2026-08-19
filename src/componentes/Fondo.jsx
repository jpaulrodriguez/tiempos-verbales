/**
 * Fondo de malla: tres manchas de color a la deriva bajo toda la interfaz.
 *
 * No es decoración gratuita. El glassmorphism en modo claro solo se percibe si
 * hay color por debajo: cristal esmerilado sobre blanco liso es indistinguible
 * de una tarjeta blanca. Estas manchas dan al blur algo que difuminar, y su
 * deriva lenta hace que el mismo cristal cambie sutilmente de tono con el
 * tiempo, que es lo que lo hace parecer material y no textura.
 *
 * Solo se anima `transform`, así que va en la GPU y no repinta nada.
 */
export default function Fondo() {
  return (
    <div className="fondo" aria-hidden="true">
      <span className="fondo__mancha fondo__mancha--menta" />
      <span className="fondo__mancha fondo__mancha--ambar" />
      <span className="fondo__mancha fondo__mancha--violeta" />
      <div className="fondo__grano" />
    </div>
  )
}
