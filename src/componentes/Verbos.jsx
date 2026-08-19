import { useMemo, useState } from 'react'
import datos from '../data/verbos.json'
import { hablar, hayVoz } from '../motor/audio.js'
import { Altavoz, Cruz } from './Iconos.jsx'

const ETIQUETAS = {
  base: 'Base',
  tercera: '3ª persona',
  ing: '-ing',
  pasado: 'Pasado',
  participio: 'Participio',
}
const ORDEN = ['base', 'tercera', 'ing', 'pasado', 'participio']

/**
 * Quita tildes para que «comunicación» encuentre «comunicacion» y al revés.
 * El rango va en escapes Unicode a propósito: escrito con los caracteres
 * combinantes literales es invisible en el editor y se rompe al copiar.
 */
const pelar = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Forma({ clave, forma, onOir }) {
  return (
    <button
      type="button" className="forma"
      onClick={() => onOir(forma.t)}
      aria-label={`Escuchar ${forma.t}`}
    >
      <span className="forma__etiqueta">{ETIQUETAS[clave]}</span>
      <span className="forma__texto">{forma.t}</span>
      <span className="forma__ipa">{forma.ipa}</span>
    </button>
  )
}

function Verbo({ verbo, onOir }) {
  return (
    <article className="verbo">
      <header className="verbo__cabecera">
        <div>
          <h3 className="verbo__nombre">{verbo.formas.base.t}</h3>
          <p className="verbo__es">{verbo.es}</p>
        </div>
        <div className="verbo__marcas">
          {verbo.tipo === 'irregular'
            ? <span className="marca marca--irregular">{verbo.patron}</span>
            : <span className="marca marca--regular">regular</span>}
          {verbo.edSonido ? <span className="marca marca--ed">-ed {verbo.edSonido}</span> : null}
        </div>
      </header>

      <div className="verbo__formas">
        {ORDEN.map((clave) => (
          <Forma key={clave} clave={clave} forma={verbo.formas[clave]} onOir={onOir} />
        ))}
      </div>
    </article>
  )
}

/**
 * Listado de verbos con sus cinco formas y la pronunciación debajo de cada una.
 *
 * Los filtros son dos tiras de fichas en vez de desplegables: en el móvil un
 * <select> abre una rueda que tapa media pantalla y obliga a confirmar, y aquí
 * lo normal es ir probando combinaciones hasta dar con el verbo.
 *
 * Tocar cualquier forma la pronuncia. La transcripción fonética sirve para
 * quien sabe leerla; para el resto, el altavoz.
 */
export default function Verbos() {
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [tema, setTema] = useState('todos')

  const TIPOS = [
    { id: 'todos', titulo: 'Todos' },
    { id: 'esencial', titulo: 'Esenciales' },
    { id: 'regular', titulo: 'Regulares' },
    { id: 'irregular', titulo: 'Irregulares' },
    ...datos.patrones.map((p) => ({ id: p.id, titulo: p.id, ayuda: `${p.titulo}: ${p.ejemplo}` })),
  ]

  const visibles = useMemo(() => {
    const q = pelar(busqueda.trim())
    return datos.verbos.filter((v) => {
      if (tema !== 'todos' && !v.temas.includes(tema)) return false
      if (tipo === 'esencial' && !v.esencial) return false
      else if (tipo === 'regular' && v.tipo !== 'regular') return false
      else if (tipo === 'irregular' && v.tipo !== 'irregular') return false
      else if (['AAA', 'ABA', 'ABB', 'ABC'].includes(tipo) && v.patron !== tipo) return false
      if (!q) return true
      // Se busca en inglés y en español, y en todas las formas: quien no
      // recuerda el infinitivo suele acordarse del pasado.
      return pelar(v.es).includes(q) ||
        Object.values(v.formas).some((f) => pelar(f.t).includes(q))
    })
  }, [busqueda, tipo, tema])

  const patronActivo = datos.patrones.find((p) => p.id === tipo)

  return (
    <div className="verbos">
      <h2 className="guia__titulo">Verbos</h2>
      <p className="guia__intro">
        Las cinco formas de cada verbo con su pronunciación. Toca cualquiera para oírla.
      </p>

      <div className="buscador">
        <input
          type="search"
          className="buscador__campo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en inglés o en español…"
          aria-label="Buscar un verbo"
          autoCapitalize="off" autoCorrect="off" spellCheck="false"
        />
        {busqueda ? (
          <button type="button" className="buscador__limpiar" onClick={() => setBusqueda('')} aria-label="Borrar la búsqueda">
            <Cruz tam={18} />
          </button>
        ) : null}
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por tipo">
        {TIPOS.map((t) => (
          <button
            key={t.id} type="button"
            className={`filtro ${tipo === t.id ? 'filtro--activo' : ''}`}
            aria-pressed={tipo === t.id}
            title={t.ayuda}
            onClick={() => setTipo(t.id)}
          >
            {t.titulo}
          </button>
        ))}
      </div>

      {/* Los patrones se llaman AAA, ABB… y eso no dice nada por sí solo:
          cuando se elige uno, se explica debajo con un ejemplo. */}
      {patronActivo ? (
        <p className="filtros__ayuda">
          <strong>{patronActivo.titulo}:</strong> {patronActivo.ejemplo}
        </p>
      ) : null}

      <div className="filtros" role="group" aria-label="Filtrar por tema">
        <button
          type="button"
          className={`filtro ${tema === 'todos' ? 'filtro--activo' : ''}`}
          aria-pressed={tema === 'todos'}
          onClick={() => setTema('todos')}
        >
          Todos los temas
        </button>
        {datos.temas.map((t) => (
          <button
            key={t.id} type="button"
            className={`filtro ${tema === t.id ? 'filtro--activo' : ''}`}
            aria-pressed={tema === t.id}
            onClick={() => setTema(t.id)}
          >
            {t.titulo}
          </button>
        ))}
      </div>

      <p className="verbos__cuenta">
        {visibles.length === datos.verbos.length
          ? `${visibles.length} verbos`
          : `${visibles.length} de ${datos.verbos.length} verbos`}
      </p>

      {!hayVoz() ? (
        <p className="aviso">Tu navegador no tiene voz: guíate por la transcripción fonética.</p>
      ) : null}

      {visibles.length === 0 ? (
        <div className="vacio">
          <p><strong>Ningún verbo con esos filtros.</strong></p>
          <p>Prueba a borrar la búsqueda o a quitar alguno.</p>
          <button
            type="button" className="boton boton--azul"
            onClick={() => { setBusqueda(''); setTipo('todos'); setTema('todos') }}
          >
            Quitar los filtros
          </button>
        </div>
      ) : (
        <div className="verbos__lista">
          {visibles.map((v) => <Verbo key={v.id} verbo={v} onOir={(t) => hablar(t, { lento: true })} />)}
        </div>
      )}

      <p className="verbos__nota"><Altavoz tam={15} /> {datos.nota}</p>
    </div>
  )
}
