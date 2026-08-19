import OpcionMultiple from './OpcionMultiple.jsx'
import Completar from './Completar.jsx'
import Ordenar from './Ordenar.jsx'
import Transformar from './Transformar.jsx'
import Emparejar from './Emparejar.jsx'
import DetectarError from './DetectarError.jsx'
import SonidoEd from './SonidoEd.jsx'
import LineaTiempo from './LineaTiempo.jsx'
import Traducir from './Traducir.jsx'
import Escuchar from './Escuchar.jsx'

const COMPONENTES = {
  opcion_multiple: OpcionMultiple,
  completar: Completar,
  ordenar: Ordenar,
  transformar: Transformar,
  emparejar: Emparejar,
  detectar_error: DetectarError,
  sonido_ed: SonidoEd,
  linea_tiempo: LineaTiempo,
  traducir: Traducir,
  escuchar: Escuchar,
}

/**
 * Elige el componente según `item.tipo`.
 * La `key` fuerza el remontaje al cambiar de ítem, lo que limpia de golpe el
 * estado interno de los ejercicios (la columna seleccionada en `emparejar`,
 * el barajado memorizado…) sin que cada componente tenga que acordarse.
 */
export default function Ejercicio(props) {
  const Componente = COMPONENTES[props.item.tipo]
  if (!Componente) {
    return <p className="aviso">Tipo de ejercicio no reconocido: <code>{props.item.tipo}</code></p>
  }
  return <Componente key={props.item.id} {...props} />
}

export const TIPOS_SOPORTADOS = Object.keys(COMPONENTES)
