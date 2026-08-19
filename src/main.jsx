import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Fondo from './componentes/Fondo.jsx'
import './estilos.css'

// El fondo va fuera de App y se monta una sola vez: así las manchas siguen su
// deriva sin reiniciarse cada vez que se cambia de pantalla.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Fondo />
    <App />
  </React.StrictMode>
)
