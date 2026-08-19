export default function DetectarError({ item, valor, setValor, bloqueado, resultado }) {
  const palabras = (item.enunciado || '').split(/\s+/)

  return (
    <div className="detectar">
      <p className="detectar__frase">
        {palabras.map((palabra, i) => {
          const elegida = valor === i
          const esError = i === item.indiceError
          let clase = 'palabra'
          if (elegida) clase += ' palabra--elegida'
          if (bloqueado && resultado) {
            if (esError) clase += ' palabra--bien'
            else if (elegida) clase += ' palabra--mal'
          }
          return (
            <button key={`${palabra}-${i}`} type="button" className={clase} disabled={bloqueado} onClick={() => setValor(i)}>
              {palabra}
            </button>
          )
        })}
      </p>
      {bloqueado && resultado && item.correccion ? (
        <p className="detectar__correccion">
          Debería ser: <strong>{item.correccion}</strong>
        </p>
      ) : null}
    </div>
  )
}
