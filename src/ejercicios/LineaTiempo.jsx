export default function LineaTiempo({ item, valor, setValor, bloqueado, resultado }) {
  const zonas = item.zonas || ['Pasado', 'Ahora', 'Futuro']

  return (
    <>
      <p className="enunciado">{item.enunciado}</p>
      <div className="linea">
        <div className="linea__eje" aria-hidden="true" />
        <div className="linea__zonas">
          {zonas.map((z) => {
            const elegida = valor === z
            let clase = 'zona'
            if (elegida) clase += ' zona--elegida'
            if (bloqueado && resultado) {
              if (z === item.respuesta) clase += ' zona--bien'
              else if (elegida) clase += ' zona--mal'
            }
            return (
              <button key={z} type="button" className={clase} disabled={bloqueado} onClick={() => setValor(z)}>
                {z}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
