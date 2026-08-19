import Fichas from './Fichas.jsx'

export default function Ordenar({ item, valor, setValor, bloqueado }) {
  return (
    <>
      {item.enunciado ? <p className="enunciado enunciado--pista">{item.enunciado}</p> : null}
      <Fichas item={item} valor={valor} setValor={setValor} bloqueado={bloqueado} fichas={item.fichas} />
    </>
  )
}
