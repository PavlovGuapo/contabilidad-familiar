import React, { useState } from 'react';
import { DollarSign, Upload, Lock, Unlock, Globe } from 'lucide-react';
import { useFinanzas } from './hooks/useFinanzas';
import Configuracion from './components/Configuracion';
import Dashboard from './components/Dashboard';

export default function ContabilidadFamiliar() {
  const finanzas = useFinanzas();
  const MESES = finanzas.idioma === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [vistaActual, setVistaActual] = useState('anual');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [intentoPassword, setIntentoPassword] = useState('');

  if (finanzas.isLocked) {
    return (
      <div className="min-h-screen bg-stone-900 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-stone-800 rounded-3xl p-8 sm:p-12 max-w-sm w-full shadow-2xl border border-stone-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-700 rounded-2xl mb-6"><Lock className="w-8 h-8 text-white" /></div>
              <h1 className="text-2xl font-bold text-white mb-2">{finanzas.t('boveda_cifrada')}</h1>
              <p className="text-stone-400 text-sm">{finanzas.t('ingresa_pass')}</p>
            </div>
            <div className="space-y-4">
               <input type="password" placeholder={finanzas.t('pass_maestra')} value={intentoPassword} onChange={e => setIntentoPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && finanzas.desbloquearApp(intentoPassword)} className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none focus:border-stone-500 text-center tracking-widest" />
               {finanzas.errorPassword && <p className="text-red-400 text-xs text-center">{finanzas.t('pass_incorrecta')}</p>}
               <button onClick={() => finanzas.desbloquearApp(intentoPassword)} className="w-full px-6 py-3 bg-stone-200 text-stone-900 rounded-xl font-bold">{finanzas.t('desbloquear')}</button>
            </div>
        </div>
      </div>
    );
  }

  if (finanzas.personas.length === 0 && !mostrarConfiguracion) {
    return (
      <div className="min-h-screen bg-stone-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-2xl mb-6"><DollarSign className="w-10 h-10 text-white" /></div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{finanzas.t('bienvenido')}</h1>
            </div>
            <div className="space-y-4">
               <button onClick={() => setMostrarConfiguracion(true)} className="w-full px-6 py-3 bg-slate-800 text-white rounded-xl font-medium">{finanzas.t('configurar_familia')}</button>
               <div className="relative py-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div></div>
               <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600">
                  <Upload className="w-5 h-5 mr-2" /> <span>{finanzas.t('cargar_respaldo')}</span>
                  <input type="file" onChange={(e) => finanzas.importarDatos(e, () => setMostrarConfiguracion(false))} className="hidden" accept=".json" />
               </label>
            </div>
        </div>
      </div>
    );
  }

  if (mostrarConfiguracion) return <Configuracion finanzas={finanzas} cerrarConfiguracion={() => setMostrarConfiguracion(false)} />;

  return (
    <div className="min-h-screen bg-stone-50 pb-12 w-full overflow-hidden">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-lg shrink-0"><DollarSign className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-xl font-bold text-slate-800 leading-tight hidden sm:block">{finanzas.t('finanzas')}</h1></div>
            </div>
            <div className="flex items-center gap-2">
              {finanzas.passwordActual && <div className="hidden md:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mr-2"><Unlock className="w-3 h-3"/> {finanzas.t('cifrado_activo')}</div>}
              <button onClick={finanzas.alternarIdioma} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"><Globe className="w-5 h-5"/></button>
              <button onClick={() => setMostrarConfiguracion(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">{finanzas.t('configuracion')}</button>
            </div>
        </div>
      </div>
      <div className="bg-white border-b border-slate-200 w-full overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 min-w-max">
            <button onClick={() => setVistaActual('anual')} className={`px-5 py-2 rounded-lg text-sm ${vistaActual === 'anual' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>{finanzas.t('resumen_anual')}</button>
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