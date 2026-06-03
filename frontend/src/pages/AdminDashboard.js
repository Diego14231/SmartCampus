import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [salas, setSalas] = useState([]);

  const fetchAdminStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/admin/status`);
      setSalas(response.data);
    } catch (error) {
      console.error("Error obteniendo datos de administración:", error);
    }
  };

  useEffect(() => {
    fetchAdminStatus();
    const interval = setInterval(fetchAdminStatus, 10000); // Admin actualiza más rápido
    return () => clearInterval(interval);
  }, []);

    if (salas.length === 0) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <p className="text-udp-neon animate-pulse">Cargando estaciones de monitoreo...</p>
        </div>
      );
    } 

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-udp-neon">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salas.map((sala) => (
            <div key={sala._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white">{sala.idSala}</h2>
                    {/* Estado lógico del sistema (TTL) */}
                    <span className={`px-2 py-1 rounded text-xs font-bold ${sala.ocupada ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{sala.ocupada ? 'OCUPADA' : 'LIBRE'}</span>
                    </div>

                <div className="space-y-3 text-sm">
                        <p className="text-slate-400">Ubicación: Piso {sala.piso}</p>
                    
                    <div className="flex items-center p-2 bg-slate-900/50 rounded-lg">
                        <span className={`h-2 w-2 rounded-full mr-3 ${sala.hayMovimiento ? 'bg-orange-500 animate-pulse' : 'bg-slate-600'}`}></span><span className={sala.hayMovimiento ? 'text-orange-400' : 'text-slate-500'}>
                        {sala.hayMovimiento ? 'Sensor: Detectando Calor' : 'Sensor: Sin Actividad'}
                        </span>
                    </div>
                
                    <p className="text-[14px] text-slate-300 italic pt-2 border-t border-slate-700">Reporte realizado a las: {new Date(sala.ultimaActualizacion).toLocaleTimeString('es-CL')}</p>
                </div>
            </div>
        ))}

      </div>
    </div>
  );
}

export default AdminDashboard;