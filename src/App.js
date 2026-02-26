import React, { useState } from 'react';
import { DollarSign, Upload } from 'lucide-react';
import { useFinanzas } from './hooks/useFinanzas';
import Configuracion from './components/Configuracion';
import Dashboard from './components/Dashboard';

export default function ContabilidadFamiliar() {
  const finanzas = useFinanzas();
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const [vistaActual, setVistaActual] = useState('anual');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  if (finanzas.personas.length === 0 && !mostrarConfiguracion) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 border border-slate-200 max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-2xl mb-6">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido</h1>
            </div>
            <div className="space-y-4">
               <button onClick={() => setMostrarConfiguracion(true)} className="w-full px-6 py-3 bg-slate-800 text-white rounded-xl font-medium">Configurar Nueva Familia</button>
               <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div></div>
               <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600">
                  <Upload className="w-5 h-5 mr-2" /> <span>Cargar Respaldo</span>
                  <input type="file" onChange={(e) => finanzas.importarDatos(e, () => setMostrarConfiguracion(false))} className="hidden" accept=".json" />
               </label>
            </div>
        </div>
      </div>
    );
  }

  if (mostrarConfiguracion) {
    return <Configuracion finanzas={finanzas} cerrarConfiguracion={() => setMostrarConfiguracion(false)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-lg"><DollarSign className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-xl font-bold text-slate-800 leading-tight">Finanzas</h1></div>
            </div>
            <button onClick={() => setMostrarConfiguracion(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm">Configuración</button>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto flex gap-2 min-w-max">
            <button onClick={() => setVistaActual('anual')} className={`px-5 py-2 rounded-lg text-sm ${vistaActual === 'anual' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Resumen Anual</button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            {MESES.map((mes, index) => (
              <button key={mes} onClick={() => { setVistaActual('mensual'); setMesSeleccionado(index); }} className={`px-4 py-2 rounded-lg text-sm ${vistaActual === 'mensual' && mesSeleccionado === index ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{mes}</button>
            ))}
        </div>
      </div>

      <Dashboard finanzas={finanzas} vistaActual={vistaActual} mesSeleccionado={mesSeleccionado} MESES={MESES} />
    </div>
  );
}