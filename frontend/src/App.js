import React, { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
  const [pisos, setPisos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos de tu API de Node.js
  const fetchStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/status');
      setPisos(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  };

  // Esto ejecuta la función apenas se abre la web y cada 30 segundos
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      {/* Encabezado */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">Smart<span className="text-udp-neon">Campus</span> UDP</h1>
        <p className="text-slate-400">Disponibilidad de salas de estudio en tiempo real</p>
      </header>

      {loading ? (
        <p className="text-udp-neon animate-pulse">Conectando con el servidor...</p>
      ) : (
        <div className="w-full max-w-md space-y-6">
          {/* Mapeamos los datos que vienen del backend */}
          {pisos.map((pisoData) => (
            <div key={pisoData._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  {pisoData._id === -1 ? 'Piso -1' : `Piso ${pisoData._id}`}
                </h2>
                <span className="bg-udp-neon/10 text-udp-neon px-3 py-1 rounded-full text-sm font-medium">
                  En línea
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-6xl font-bold text-udp-neon">{pisoData.totalDisponibles}</span>
                <span className="text-xl text-slate-400">salas libres</span>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center text-slate-500 text-sm">
                <i className="fa-regular fa-clock mr-2"></i>
                Actualizado: {new Date(pisoData.ultimaActualizacion).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {/* Mensaje de Gestión de Expectativas */}
          <div className="mt-8 p-4 bg-slate-800/30 rounded-2xl text-center">
            <p className="text-sm text-slate-400 italic">
              "Recuerda que la disponibilidad puede cambiar, ya que se realizan actualizaciones cada 30 segundos."
            </p>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-10 text-slate-600 text-xs text-center">
        &copy; 2026 SmartCampus Project
      </footer>
    </div>
  );
}

export default App;