import { Casa, Libro, Perfil } from './Iconos.jsx'

const PESTANAS = [
  { id: 'mapa', etiqueta: 'Aprender', Icono: Casa },
  { id: 'guia', etiqueta: 'Guía', Icono: Libro },
  { id: 'perfil', etiqueta: 'Perfil', Icono: Perfil },
]

/**
 * Navegación principal: tres pestañas abajo, siempre visibles fuera de la
 * lección. Icono + texto en cada una, porque un icono solo obliga a adivinar
 * — y «fácil de ubicar» era el requisito. Durante la lección se oculta: ahí
 * el alumno está a una sola cosa.
 */
export default function BarraTabs({ activa, onCambiar }) {
  return (
    <nav className="tabs" aria-label="Navegación principal">
      {/* Solo se ve cuando la barra se convierte en columna lateral: en el
          escritorio una franja con tres iconos y nada más parece un resto. */}
      <span className="tabs__marca">Tiempos Verbales</span>
      {PESTANAS.map(({ id, etiqueta, Icono }) => (
        <button
          key={id}
          type="button"
          className={`tab ${activa === id ? 'tab--activa' : ''}`}
          aria-current={activa === id ? 'page' : undefined}
          onClick={() => onCambiar(id)}
        >
          <Icono tam={22} />
          <span>{etiqueta}</span>
        </button>
      ))}
    </nav>
  )
}
