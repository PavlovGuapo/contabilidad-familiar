import React, { useState } from 'react';
import { Plus, Trash2, Download, Upload, Target, FileSpreadsheet, Shield, ShieldOff } from 'lucide-react';

export default function Configuracion({ finanzas, cerrarConfiguracion }) {
  const {
    COLORES_DISPONIBLES, personas, setPersonas, seccionesIngresos, setSeccionesIngresos, seccionesGastos, setSeccionesGastos,
    gastosFijos, setGastosFijos, metasAhorro, setMetasAhorro, t, exportarDatos, exportarCSV, importarDatos, formatearMoneda, configurarPassword, passwordActual
  } = finanzas;

  const [nuevaPersona, setNuevaPersona] = useState({ nombre: '', color: COLORES_DISPONIBLES[0] });
  const [nuevaMeta, setNuevaMeta] = useState({ nombre: '', montoObjetivo: '' });
  const [inputPassword, setInputPassword] = useState('');
  
  // Nuevo estado para gastos fijos con múltiples pagadores
  const [nuevoGastoFijo, setNuevoGastoFijo] = useState({ descripcion: '', monto: '', periodicidadMeses: '1', fechaInicio: new Date().toISOString().split('T')[0] });
  const [pagadoresFijos, setPagadoresFijos] = useState([{ personaId: '', porcentaje: 100 }]);

  const manejarPassword = () => { configurarPassword(inputPassword); setInputPassword(''); };
  const agregarPersona = () => { if (nuevaPersona.nombre.trim()) { setPersonas([...personas, { id: Date.now().toString(), nombre: nuevaPersona.nombre, color: nuevaPersona.color }]); setNuevaPersona({ nombre: '', color: COLORES_DISPONIBLES[0] }); } };
  const eliminarPersona = (id) => setPersonas(personas.filter(p => p.id !== id));
  
  const agregarGastoFijo = () => { 
    if(!nuevoGastoFijo.descripcion || !nuevoGastoFijo.monto) return;
    const sumaPorcentajes = pagadoresFijos.reduce((acc, p) => acc + Number(p.porcentaje), 0);
    if(sumaPorcentajes !== 100) return alert(t('error_porcentaje'));
    if(pagadoresFijos.some(p => !p.personaId)) return;

    setGastosFijos([...gastosFijos, { ...nuevoGastoFijo, id: Date.now().toString(), monto: parseFloat(nuevoGastoFijo.monto), pagadores: pagadoresFijos }]); 
    setNuevoGastoFijo({ descripcion: '', monto: '', periodicidadMeses: '1', fechaInicio: new Date().toISOString().split('T')[0] }); 
    setPagadoresFijos([{ personaId: '', porcentaje: 100 }]);
  };
  
  const eliminarGastoFijo = (id) => setGastosFijos(gastosFijos.filter(g => g.id !== id));
  const agregarMeta = () => { if (!nuevaMeta.nombre || !nuevaMeta.montoObjetivo) return; setMetasAhorro([...metasAhorro, { id: Date.now().toString(), nombre: nuevaMeta.nombre, montoObjetivo: parseFloat(nuevaMeta.montoObjetivo), montoAhorrado: 0 }]); setNuevaMeta({ nombre: '', montoObjetivo: '' }); };
  const eliminarMeta = (id) => setMetasAhorro(metasAhorro.filter(m => m.id !== id));
  const agregarSeccionIngreso = () => setSeccionesIngresos([...seccionesIngresos, { id: Date.now().toString(), nombre: t('nueva_seccion_ingreso'), subsecciones: [] }]);
  const agregarSubseccionIngreso = (seccionId) => setSeccionesIngresos(seccionesIngresos.map(s => s.id === seccionId ? { ...s, subsecciones: [...s.subsecciones, { id: Date.now().toString(), nombre: t('concepto') }] } : s));
  const agregarSeccionGasto = () => setSeccionesGastos([...seccionesGastos, { id: Date.now().toString(), nombre: t('nueva_categoria_gasto'), limite: 0, color: COLORES_DISPONIBLES[seccionesGastos.length % COLORES_DISPONIBLES.length], subsecciones: [] }]);
  const agregarSubseccionGasto = (seccionId) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccionId ? { ...s, subsecciones: [...s.subsecciones, { id: Date.now().toString(), nombre: t('subcategoria'), gastos: [] }] } : s));

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold">{t('configuracion')}</h1>
              <button onClick={cerrarConfiguracion} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium">{t('guardar_salir')}</button>
          </div>
          <div className="flex flex-wrap gap-4 p-4 bg-slate-800 rounded-xl items-center">
              <button onClick={exportarDatos} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"><Download className="w-4 h-4" /> {t('respaldo_json')}</button>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm cursor-pointer"><Upload className="w-4 h-4" /> {t('importar')}<input type="file" onChange={(e) => importarDatos(e)} className="hidden" accept=".json" /></label>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-12">
          {/* ... Secciones de Seguridad y Miembros (sin cambios) ... */}

          <section><h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-8 h-1 bg-slate-500 rounded-full"></div> {t('gastos_fijos')}</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <input type="text" placeholder={t('descripcion')} value={nuevoGastoFijo.descripcion} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, descripcion: e.target.value})} className="px-3 py-2 border rounded-lg md:col-span-2" />
                <input type="number" placeholder={t('monto')} value={nuevoGastoFijo.monto} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, monto: e.target.value})} className="px-3 py-2 border rounded-lg" />
                <select value={nuevoGastoFijo.periodicidadMeses} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, periodicidadMeses: e.target.value})} className="px-3 py-2 border rounded-lg"><option value="1">{t('mensual')}</option><option value="2">{t('bimestral')}</option><option value="3">{t('trimestral')}</option><option value="6">{t('semestral')}</option><option value="12">{t('anual')}</option></select>
              </div>
              
              {/* Sección de múltiples pagadores */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                  <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-slate-700">{t('pagadores')}</span><button onClick={() => setPagadoresFijos([...pagadoresFijos, {personaId: '', porcentaje: 0}])} className="text-xs px-2 py-1 bg-slate-200 rounded">{t('agregar_pagador')}</button></div>
                  {pagadoresFijos.map((p, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                          <select value={p.personaId} onChange={e => { const newP = [...pagadoresFijos]; newP[index].personaId = e.target.value; setPagadoresFijos(newP); }} className="flex-1 px-2 py-1 border rounded text-sm"><option value="">{t('quien_paga')}</option>{personas.map(per => <option key={per.id} value={per.id}>{per.nombre}</option>)}</select>
                          <div className="flex items-center gap-1"><input type="number" value={p.porcentaje} onChange={e => { const newP = [...pagadoresFijos]; newP[index].porcentaje = e.target.value; setPagadoresFijos(newP); }} className="w-16 px-2 py-1 border rounded text-sm text-center" /><span className="text-xs">%</span></div>
                          {pagadoresFijos.length > 1 && <button onClick={() => setPagadoresFijos(pagadoresFijos.filter((_, i) => i !== index))} className="text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>}
                      </div>
                  ))}
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center"><label className="text-sm text-slate-600 font-medium shrink-0">{t('primer_cobro')}</label><input type="date" value={nuevoGastoFijo.fechaInicio} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, fechaInicio: e.target.value})} className="px-3 py-2 border rounded-lg flex-1" /><button onClick={agregarGastoFijo} className="px-6 py-2 bg-slate-800 text-white rounded-lg w-full md:w-auto">{t('guardar')}</button></div>
            </div>
            
            <div className="space-y-2">{gastosFijos.map(g => (<div key={g.id} className="flex justify-between items-center p-3 border rounded-lg bg-white"><div><p className="font-bold text-slate-700">{g.descripcion} <span className="font-normal text-slate-500 ml-2">{formatearMoneda(g.monto)}</span></p><p className="text-xs text-slate-400">{t('inicia')} {g.fechaInicio} | {t('cada')} {g.periodicidadMeses} {t('meses')}</p></div><button onClick={() => eliminarGastoFijo(g.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>))}</div>
          </section>

          {/* ... Resto de secciones de configuración (Metas, Ingresos y Categorías sin cambios estructurales) ... */}
        </div>
      </div>
    </div>
  );
}