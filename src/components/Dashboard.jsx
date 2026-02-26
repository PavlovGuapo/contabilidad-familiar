import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trash2, Plus } from 'lucide-react';
import Calendario from './Calendario';

export default function Dashboard({ finanzas, vistaActual, mesSeleccionado, MESES }) {
  const {
    COLORES_DISPONIBLES, personas, seccionesGastos, setSeccionesGastos, metasAhorro, setMetasAhorro, t,
    aplicaGastoFijoEnMes, formatearMoneda, calcularIngresosPersona, calcularGastosPersona,
    calcularIngresosFamilia, calcularGastosFamilia, calcularGastosPorCategoria, ANIO_ACTUAL, gastosFijos
  } = finanzas;

  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({ seccionId: '', subseccionId: '', personaId: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
  const [aportacion, setAportacion] = useState({});

  const generarDatosGraficaAnual = () => MESES.map((mes, index) => ({
    mes: mes.substring(0, 3), ingresos: calcularIngresosFamilia(index), gastos: calcularGastosFamilia(index)
  }));

  const generarDatosGraficaCategoria = (mes = null) => {
    const gastosCat = calcularGastosPorCategoria(mes);
    return Object.entries(gastosCat).filter(([, val]) => val > 0).map(([nombre, valor]) => ({ nombre, valor }));
  };

  const agregarGasto = () => {
    if (!nuevoGasto.seccionId || !nuevoGasto.subseccionId || !nuevoGasto.personaId || !nuevoGasto.monto) return;
    const gasto = { id: Date.now().toString(), personaId: nuevoGasto.personaId, monto: parseFloat(nuevoGasto.monto), descripcion: nuevoGasto.descripcion, fecha: nuevoGasto.fecha, mes: mesSeleccionado };
    setSeccionesGastos(seccionesGastos.map(s => s.id === nuevoGasto.seccionId ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === nuevoGasto.subseccionId ? { ...sub, gastos: [...sub.gastos, gasto] } : sub) } : s));
    setNuevoGasto({ seccionId: '', subseccionId: '', personaId: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
    setMostrarFormGasto(false);
  };

  const eliminarGasto = (secId, subId, gasId) => setSeccionesGastos(seccionesGastos.map(s => s.id === secId ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === subId ? { ...sub, gastos: sub.gastos.filter(g => g.id !== gasId) } : sub) } : s));

  const manejarAportacion = (idMeta) => {
    const monto = parseFloat(aportacion[idMeta]);
    if (!monto || monto <= 0) return;
    setMetasAhorro(metasAhorro.map(m => m.id === idMeta ? { ...m, montoAhorrado: m.montoAhorrado + monto } : m));
    setAportacion({ ...aportacion, [idMeta]: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('ingresos_totales')}</p><span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">{formatearMoneda(vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('gastos_totales')}</p><span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">{formatearMoneda(vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">{t('balance_neto')}</p>
              <span className="text-2xl sm:text-3xl font-bold text-slate-800 break-all">
                  {formatearMoneda((vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado)) - (vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado)))}
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8 overflow-hidden">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">{t('comportamiento_financiero')}</h3>
                  <div className="h-72 w-full min-w-[500px]">
                      {vistaActual === 'anual' ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={generarDatosGraficaAnual()}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={val => `$${val/1000}k`} />
                              <Tooltip cursor={{fill: '#f1f5f9'}} />
                              <Bar dataKey="ingresos" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="gastos" fill="#475569" radius={[2, 2, 0, 0]} />
                              </BarChart>
                          </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl px-4 text-center">{t('vista_mensual_abajo')}</div>
                      )}
                  </div>
              </div>

              {vistaActual === 'mensual' && (
                  <>
                      <Calendario mesSeleccionado={mesSeleccionado} anioActual={ANIO_ACTUAL} gastosFijos={gastosFijos} aplicaGastoFijoEnMes={aplicaGastoFijoEnMes} formatearMoneda={formatearMoneda} t={t} />
                      
                      <div className="bg-white rounded-2xl border border-slate-200 mt-6 overflow-hidden">
                          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
                              <h3 className="text-lg font-bold text-slate-800">{t('gastos_variables')} ({MESES[mesSeleccionado]})</h3>
                              <button onClick={() => setMostrarFormGasto(!mostrarFormGasto)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm w-full sm:w-auto">{t('agregar_gasto_variable')}</button>
                          </div>
                          
                          {mostrarFormGasto && (
                          <div className="p-4 sm:p-6 bg-slate-100 border-b border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <select className="p-2 border rounded outline-none" value={nuevoGasto.seccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, seccionId: e.target.value, subseccionId: ''})}>
                                      <option value="">{t('categoria')}</option>
                                      {seccionesGastos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                  </select>
                                  <select className="p-2 border rounded outline-none" disabled={!nuevoGasto.seccionId} value={nuevoGasto.subseccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, subseccionId: e.target.value})}>
                                      <option value="">{t('subcategoria')}</option>
                                      {seccionesGastos.find(s => s.id === nuevoGasto.seccionId)?.subsecciones.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                                  </select>
                                  <select className="p-2 border rounded outline-none" value={nuevoGasto.personaId} onChange={(e) => setNuevoGasto({...nuevoGasto, personaId: e.target.value})}>
                                      <option value="">{t('quien_pago')}</option>
                                      {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                  </select>
                                  <input type="number" placeholder={t('monto')} className="p-2 border rounded outline-none" value={nuevoGasto.monto} onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})} />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                  <input type="text" placeholder={t('descripcion')} className="flex-1 p-2 border rounded outline-none" value={nuevoGasto.descripcion} onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})} />
                                  <button onClick={agregarGasto} className="px-6 py-2 bg-slate-800 text-white rounded">{t('guardar')}</button>
                              </div>
                          </div>
                          )}

                          <div className="divide-y divide-slate-100">
                          {seccionesGastos.map(seccion => 
                              seccion.subsecciones.map(sub => 
                                  sub.gastos.filter(g => g.mes === mesSeleccionado).map(gasto => (
                                      <div key={gasto.id} className="p-4 flex flex-col sm:flex-row justify-between hover:bg-slate-50 group gap-2">
                                          <div className="flex gap-3">
                                              <div className="overflow-hidden">
                                                  <p className="font-medium text-slate-800 truncate">{sub.nombre} <span className="text-slate-400">| {gasto.descripcion}</span></p>
                                                  <p className="text-xs text-slate-500">{personas.find(p => p.id === gasto.personaId)?.nombre} • {gasto.fecha}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center justify-between sm:justify-end gap-4">
                                              <span className="font-bold">{formatearMoneda(gasto.monto)}</span>
                                              <button onClick={() => eliminarGasto(seccion.id, sub.id, gasto.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                      </div>
                                  ))
                              )
                          )}
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
                          return (
                              <div key={persona.id} className="pb-4 border-b last:border-0 last:pb-0">
                                  <div className="flex justify-between mb-2">
                                      <span className="font-medium text-slate-700">{persona.nombre}</span>
                                      <span className="text-sm font-bold text-slate-800">{formatearMoneda(ing - gas)}</span>
                                  </div>
                                  <div className="flex text-xs text-slate-500 justify-between">
                                      <span>{t('ing')} {formatearMoneda(ing)}</span>
                                      <span>{t('gas')} {formatearMoneda(gas)}</span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t('metas_ahorro')}</h3>
                  <div className="space-y-5">
                      {metasAhorro.map(meta => {
                          const porcentaje = Math.min((meta.montoAhorrado / meta.montoObjetivo) * 100, 100);
                          const metaCumplida = porcentaje >= 100;

                          return (
                              <div key={meta.id}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium text-slate-700 truncate mr-2">{meta.nombre}</span>
                                      <span className="text-slate-500 text-xs shrink-0">{formatearMoneda(meta.montoAhorrado)} / {formatearMoneda(meta.montoObjetivo)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${porcentaje}%`, backgroundColor: metaCumplida ? '#10b981' : '#64748b' }} />
                                  </div>
                                  {!metaCumplida && (
                                      <div className="flex gap-2 mt-2">
                                          <input type="number" placeholder={t('monto')} value={aportacion[meta.id] || ''} onChange={(e) => setAportacion({ ...aportacion, [meta.id]: e.target.value })} className="w-full px-2 py-1 text-xs border border-slate-300 rounded outline-none" />
                                          <button onClick={() => manejarAportacion(meta.id)} className="px-3 py-1 bg-slate-800 text-white rounded text-xs flex items-center gap-1 shrink-0"><Plus className="w-3 h-3"/> {t('aportar')}</button>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
                      {metasAhorro.length === 0 && (
                          <div className="text-center text-slate-400 text-sm py-4">{t('no_metas')}</div>
                      )}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t('control_presupuestos')}</h3>
                  <div className="space-y-5">
                      {seccionesGastos.filter(s => s.limite > 0).map(seccion => {
                          const gastado = calcularGastosPorCategoria(vistaActual === 'mensual' ? mesSeleccionado : null)[seccion.nombre] || 0;
                          const limiteCalculado = vistaActual === 'anual' ? seccion.limite * 12 : seccion.limite;
                          const porcentaje = Math.min((gastado / limiteCalculado) * 100, 100);
                          const enPeligro = porcentaje >= 90;

                          return (
                              <div key={seccion.id}>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-medium text-slate-700 truncate mr-2">{seccion.nombre}</span>
                                      <span className="text-slate-500 text-xs shrink-0">{formatearMoneda(gastado)} / {formatearMoneda(limiteCalculado)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${porcentaje}%`, backgroundColor: enPeligro ? '#ef4444' : seccion.color }} />
                                  </div>
                              </div>
                          );
                      })}
                      {seccionesGastos.filter(s => s.limite > 0).length === 0 && (
                          <div className="text-center text-slate-400 text-sm py-4">{t('no_limites')}</div>
                      )}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{t('distribucion_gastos')}</h3>
                  {generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null).length > 0 ? (
                      <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie data={generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null)} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="valor">
                                      {generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null).map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORES_DISPONIBLES[index % COLORES_DISPONIBLES.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip formatter={val => formatearMoneda(val)} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  ) : (
                      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">{t('no_datos')}</div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}