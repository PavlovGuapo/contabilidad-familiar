import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trash2, Plus, ArrowRightLeft } from 'lucide-react';
import Calendario from './Calendario';

export default function Dashboard({ finanzas, vistaActual, mesSeleccionado, MESES }) {
  const {
    COLORES_DISPONIBLES, personas, seccionesGastos, setSeccionesGastos, metasAhorro, setMetasAhorro, t,
    aplicaGastoFijoEnMes, formatearMoneda, calcularIngresosPersona, calcularGastosPersona, calcularTransferenciasPersona,
    calcularIngresosFamilia, calcularGastosFamilia, calcularTransferenciasExternasFamilia, calcularGastosPorCategoria, ANIO_ACTUAL, gastosFijos,
    seccionesIngresos, ingresos, setIngresos, transferencias, setTransferencias
  } = finanzas;

  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({ seccionId: '', subseccionId: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
  const [pagadoresVariables, setPagadoresVariables] = useState([{ personaId: '', porcentaje: 100 }]);
  
  const [mostrarFormTransf, setMostrarFormTransf] = useState(false);
  const [nuevaTransf, setNuevaTransf] = useState({ origen: '', destino: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
  
  const [aportacion, setAportacion] = useState({});

  const generarDatosGraficaAnual = () => MESES.map((mes, index) => ({ mes: mes.substring(0, 3), ingresos: calcularIngresosFamilia(index), gastos: calcularGastosFamilia(index) + calcularTransferenciasExternasFamilia(index) }));
  const generarDatosGraficaCategoria = (mes = null) => Object.entries(calcularGastosPorCategoria(mes)).filter(([, val]) => val > 0).map(([nombre, valor]) => ({ nombre, valor }));

  const agregarGasto = () => {
    if (!nuevoGasto.seccionId || !nuevoGasto.subseccionId || !nuevoGasto.monto) return;
    if (pagadoresVariables.reduce((acc, p) => acc + Number(p.porcentaje), 0) !== 100) return alert(t('error_porcentaje'));
    if (pagadoresVariables.some(p => !p.personaId)) return;

    const gasto = { id: Date.now().toString(), pagadores: pagadoresVariables, monto: parseFloat(nuevoGasto.monto), descripcion: nuevoGasto.descripcion, fecha: nuevoGasto.fecha, mes: mesSeleccionado };
    setSeccionesGastos(seccionesGastos.map(s => s.id === nuevoGasto.seccionId ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === nuevoGasto.subseccionId ? { ...sub, gastos: [...sub.gastos, gasto] } : sub) } : s));
    setNuevoGasto({ seccionId: '', subseccionId: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
    setPagadoresVariables([{ personaId: '', porcentaje: 100 }]); setMostrarFormGasto(false);
  };
  const eliminarGasto = (secId, subId, gasId) => setSeccionesGastos(seccionesGastos.map(s => s.id === secId ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === subId ? { ...sub, gastos: sub.gastos.filter(g => g.id !== gasId) } : sub) } : s));

  const agregarTransferencia = () => {
    if(!nuevaTransf.origen || !nuevaTransf.destino || !nuevaTransf.monto) return;
    setTransferencias([...transferencias, { ...nuevaTransf, id: Date.now().toString(), monto: parseFloat(nuevaTransf.monto), mes: mesSeleccionado }]);
    setNuevaTransf({ origen: '', destino: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] }); setMostrarFormTransf(false);
  };
  const eliminarTransferencia = (id) => setTransferencias(transferencias.filter(t => t.id !== id));

  const formatearNombresPagadores = (gasto) => {
    if(gasto.pagadores) return gasto.pagadores.map(p => `${personas.find(per => per.id === p.personaId)?.nombre} (${p.porcentaje}%)`).join(', ');
    return personas.find(p => p.id === gasto.personaId)?.nombre || ''; // Retrocompatibilidad
  };

  const balanceNetoFamilia = (m) => calcularIngresosFamilia(m) - calcularGastosFamilia(m) - calcularTransferenciasExternasFamilia(m);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('ingresos_totales')}</p><span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">{formatearMoneda(vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('gastos_totales')}</p><span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">{formatearMoneda(vistaActual === 'anual' ? calcularGastosFamilia() + calcularTransferenciasExternasFamilia() : calcularGastosFamilia(mesSeleccionado) + calcularTransferenciasExternasFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('balance_neto')}</p><span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">{formatearMoneda(vistaActual === 'anual' ? balanceNetoFamilia() : balanceNetoFamilia(mesSeleccionado))}</span></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8 overflow-hidden">
              {/* ... Gráfica Anual (sin cambios visuales) ... */}
              
              {vistaActual === 'mensual' && (
                  <>
                      {/* ... Calendario e Ingresos (sin cambios estructurales) ... */}
                      
                      {/* Sección de Gastos Variables (Actualizada para múltiples pagadores) */}
                      <div className="bg-white rounded-2xl border border-slate-200 mt-6 overflow-hidden">
                          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
                              <h3 className="text-lg font-bold text-slate-800">{t('gastos_variables')} ({MESES[mesSeleccionado]})</h3>
                              <button onClick={() => setMostrarFormGasto(!mostrarFormGasto)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm w-full sm:w-auto">{t('agregar_gasto_variable')}</button>
                          </div>
                          
                          {mostrarFormGasto && (
                          <div className="p-4 sm:p-6 bg-slate-100 border-b border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                  <select className="p-2 border rounded outline-none" value={nuevoGasto.seccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, seccionId: e.target.value, subseccionId: ''})}><option value="">{t('categoria')}</option>{seccionesGastos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
                                  <select className="p-2 border rounded outline-none" disabled={!nuevoGasto.seccionId} value={nuevoGasto.subseccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, subseccionId: e.target.value})}><option value="">{t('subcategoria')}</option>{seccionesGastos.find(s => s.id === nuevoGasto.seccionId)?.subsecciones.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}</select>
                                  <input type="number" placeholder={t('monto')} className="p-2 border rounded outline-none" value={nuevoGasto.monto} onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})} />
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                                  <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-slate-700">{t('pagadores')}</span><button onClick={() => setPagadoresVariables([...pagadoresVariables, {personaId: '', porcentaje: 0}])} className="text-xs px-2 py-1 bg-slate-200 rounded">{t('agregar_pagador')}</button></div>
                                  {pagadoresVariables.map((p, index) => (
                                      <div key={index} className="flex gap-2 mb-2">
                                          <select value={p.personaId} onChange={e => { const newP = [...pagadoresVariables]; newP[index].personaId = e.target.value; setPagadoresVariables(newP); }} className="flex-1 px-2 py-1 border rounded text-sm"><option value="">{t('quien_pago')}</option>{personas.map(per => <option key={per.id} value={per.id}>{per.nombre}</option>)}</select>
                                          <div className="flex items-center gap-1"><input type="number" value={p.porcentaje} onChange={e => { const newP = [...pagadoresVariables]; newP[index].porcentaje = e.target.value; setPagadoresVariables(newP); }} className="w-16 px-2 py-1 border rounded text-sm text-center" /><span className="text-xs">%</span></div>
                                          {pagadoresVariables.length > 1 && <button onClick={() => setPagadoresVariables(pagadoresVariables.filter((_, i) => i !== index))} className="text-red-500 p-1"><Trash2 className="w-4 h-4"/></button>}
                                      </div>
                                  ))}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                  <input type="text" placeholder={t('descripcion')} className="flex-1 p-2 border rounded outline-none" value={nuevoGasto.descripcion} onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})} />
                                  <button onClick={agregarGasto} className="px-6 py-2 bg-slate-800 text-white rounded">{t('guardar')}</button>
                              </div>
                          </div>
                          )}

                          <div className="divide-y divide-slate-100">
                          {seccionesGastos.map(seccion => seccion.subsecciones.map(sub => sub.gastos.filter(g => g.mes === mesSeleccionado).map(gasto => (
                                  <div key={gasto.id} className="p-4 flex flex-col sm:flex-row justify-between hover:bg-slate-50 group gap-2">
                                      <div className="flex gap-3"><div className="overflow-hidden"><p className="font-medium text-slate-800 truncate">{sub.nombre} <span className="text-slate-400">| {gasto.descripcion}</span></p><p className="text-xs text-slate-500">{formatearNombresPagadores(gasto)} • {gasto.fecha}</p></div></div>
                                      <div className="flex items-center justify-between sm:justify-end gap-4"><span className="font-bold">{formatearMoneda(gasto.monto)}</span><button onClick={() => eliminarGasto(seccion.id, sub.id, gasto.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                                  </div>
                          ))))}
                          </div>
                      </div>

                      {/* Nueva Sección de Transferencias */}
                      <div className="bg-white rounded-2xl border border-slate-200 mt-6 overflow-hidden">
                          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
                              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5"/> {t('transferencias')} ({MESES[mesSeleccionado]})</h3>
                              <button onClick={() => setMostrarFormTransf(!mostrarFormTransf)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm w-full sm:w-auto">{t('nueva_transferencia')}</button>
                          </div>
                          
                          {mostrarFormTransf && (
                          <div className="p-4 sm:p-6 bg-indigo-50 border-b border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                  <select className="p-2 border rounded outline-none" value={nuevaTransf.origen} onChange={(e) => setNuevaTransf({...nuevaTransf, origen: e.target.value})}><option value="">{t('origen')}</option>{personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
                                  <select className="p-2 border rounded outline-none" value={nuevaTransf.destino} onChange={(e) => setNuevaTransf({...nuevaTransf, destino: e.target.value})}><option value="">{t('destino')}</option><option value="externo" className="font-bold text-slate-700">-- {t('externo')} --</option>{personas.filter(p => p.id !== nuevaTransf.origen).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
                                  <input type="number" placeholder={t('monto')} className="p-2 border rounded outline-none" value={nuevaTransf.monto} onChange={(e) => setNuevaTransf({...nuevaTransf, monto: e.target.value})} />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                  <input type="text" placeholder={t('descripcion')} className="flex-1 p-2 border rounded outline-none" value={nuevaTransf.descripcion} onChange={(e) => setNuevaTransf({...nuevaTransf, descripcion: e.target.value})} />
                                  <button onClick={agregarTransferencia} className="px-6 py-2 bg-indigo-600 text-white rounded">{t('guardar')}</button>
                              </div>
                          </div>
                          )}

                          <div className="divide-y divide-slate-100">
                          {transferencias.filter(t => t.mes === mesSeleccionado).map(transf => (
                              <div key={transf.id} className="p-4 flex flex-col sm:flex-row justify-between hover:bg-slate-50 group gap-2">
                                  <div className="flex gap-3"><div className="overflow-hidden"><p className="font-medium text-slate-800 truncate">{personas.find(p => p.id === transf.origen)?.nombre} ➔ {transf.destino === 'externo' ? t('externo') : personas.find(p => p.id === transf.destino)?.nombre}</p><p className="text-xs text-slate-500">{transf.descripcion} • {transf.fecha}</p></div></div>
                                  <div className="flex items-center justify-between sm:justify-end gap-4"><span className="font-bold text-indigo-600">{formatearMoneda(transf.monto)}</span><button onClick={() => eliminarTransferencia(transf.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                              </div>
                          ))}
                          {transferencias.filter(t => t.mes === mesSeleccionado).length === 0 && <div className="p-4 text-center text-sm text-slate-400">{t('no_datos')}</div>}
                          </div>
                      </div>
                  </>
              )}
          </div>

          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t('balance_individual')}</h3>
                  <div className="space-y-4">
                      {personas.map(persona => {
                          const ing = vistaActual === 'anual' ? calcularIngresosPersona(persona.id) : calcularIngresosPersona(persona.id, mesSeleccionado);
                          const gas = vistaActual === 'anual' ? calcularGastosPersona(persona.id) : calcularGastosPersona(persona.id, mesSeleccionado);
                          const transf = vistaActual === 'anual' ? calcularTransferenciasPersona(persona.id) : calcularTransferenciasPersona(persona.id, mesSeleccionado);
                          const balanceTotal = ing - gas + transf;
                          
                          return (
                              <div key={persona.id} className="pb-4 border-b last:border-0 last:pb-0">
                                  <div className="flex justify-between mb-2">
                                      <span className="font-medium text-slate-700">{persona.nombre}</span>
                                      <span className={`text-sm font-bold ${balanceTotal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatearMoneda(balanceTotal)}</span>
                                  </div>
                                  <div className="flex text-xs text-slate-500 justify-between">
                                      <span>{t('ing')} {formatearMoneda(ing)}</span>
                                      <span>{t('gas')} {formatearMoneda(gas)}</span>
                                      <span className={transf < 0 ? 'text-rose-500' : transf > 0 ? 'text-indigo-500' : ''}>{t('transf')} {formatearMoneda(transf)}</span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
              
              {/* ... Resto de tarjetas de Metas de Ahorro, Control de Presupuestos y Distribución (sin cambios) ... */}
          </div>
      </div>
    </div>
  );
}