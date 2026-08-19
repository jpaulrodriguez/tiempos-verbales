/**
 * Pinta el enunciado sustituyendo el marcador ___ por el hueco.
 * Si el ítem trae `ayuda` (el infinitivo), se muestra entre paréntesis después
 * del hueco, como en los libros de texto: "She ___ (go) to the gym".
 */
export default function Enunciado({ item, hueco, comoInput = null }) {
  const texto = item.enunciado || ''
  if (!texto) return null

  // Red de seguridad: `hueco` sale del estado de la lección, y algunos tipos de
  // ejercicio guardan ahí objetos (emparejar) o arrays (fichas). Intentar
  // pintarlos como texto tumba el árbol de React entero y deja la pantalla en
  // blanco, así que por aquí solo pasan cadenas y números.
  const contenido = ['string', 'number'].includes(typeof hueco) ? String(hueco) : ''

  const partes = texto.split('___')
  if (partes.length === 1) {
    return <p className="enunciado">{texto}</p>
  }

  return (
    <p className="enunciado">
      {partes[0]}
      {comoInput ?? (
        <span className={`hueco ${contenido ? 'hueco--lleno' : ''}`}>{contenido || ' '}</span>
      )}
      {item.ayuda ? <span className="ayuda"> ({item.ayuda})</span> : null}
      {partes.slice(1).join('___')}
    </p>
  )
}
