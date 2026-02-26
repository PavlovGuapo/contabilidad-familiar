import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trash2 } from 'lucide-react';
import Calendario from './Calendario';

export default function Dashboard({ finanzas, vistaActual, mesSeleccionado, MESES }) {
  const {
    COLORES_DISPONIBLES, personas, seccionesGastos, setSeccionesGastos,
    aplicaGastoFijoEnMes, formatearMoneda, calcularIngresosPersona, calcularGastosPersona,
    calcularIngresosFamilia, calcularGastosFamilia, calcularGastosPorCategoria, ANIO_ACTUAL, gastosFijos
  } = finanzas;

  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({ seccionId: '', subseccionId: '', personaId: '', monto: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">Ingresos Totales</p><span className="text-3xl font-bold text-slate-800">{formatearMoneda(vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">Gastos Totales</p><span className="text-3xl font-bold text-slate-800">{formatearMoneda(vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado))}</span></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><p className="text-sm text-slate-500 mb-1">Balance Neto</p>
              <span className="text-3xl font-bold text-slate-800">
                  {formatearMoneda((vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado)) - (vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado)))}
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Comportamiento Financiero</h3>
                  <div className="h-72 w-full">
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
                          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">Vista mensual detallada abajo</div>
                      )}
                  </div>
              </div>

              {vistaActual === 'mensual' && (
                  <>
                      <Calendario mesSeleccionado={mesSeleccionado} anioActual={ANIO_ACTUAL} gastosFijos={gastosFijos} aplicaGastoFijoEnMes={aplicaGastoFijoEnMes} formatearMoneda={formatearMoneda} />
                      
                      <div className="bg-white rounded-2xl border border-slate-200 mt-6 overflow-hidden">
                          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                              <h3 className="text-lg font-bold text-slate-800">Gastos Variables ({MESES[mesSeleccionado]})</h3>
                              <button onClick={() => setMostrarFormGasto(!mostrarFormGasto)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Agregar Gasto Variable</button>
                          </div>
                          
                          {mostrarFormGasto && (
                          <div className="p-6 bg-slate-100 border-b border-slate-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <select className="p-2 border rounded" value={nuevoGasto.seccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, seccionId: e.target.value, subseccionId: ''})}>
                                      <option value="">Categoría...</option>
                                      {seccionesGastos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                  </select>
                                  <select className="p-2 border rounded" disabled={!nuevoGasto.seccionId} value={nuevoGasto.subseccionId} onChange={(e) => setNuevoGasto({...nuevoGasto, subseccionId: e.target.value})}>
                                      <option value="">Subcategoría...</option>
                                      {seccionesGastos.find(s => s.id === nuevoGasto.seccionId)?.subsecciones.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                                  </select>
                                  <select className="p-2 border rounded" value={nuevoGasto.personaId} onChange={(e) => setNuevoGasto({...nuevoGasto, personaId: e.target.value})}>
                                      <option value="">Quién pagó...</option>
                                      {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                  </select>
                                  <input type="number" placeholder="Monto" className="p-2 border rounded" value={nuevoGasto.monto} onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})} />
                              </div>
                              <div className="flex gap-2">
                                  <input type="text" placeholder="Descripción" className="flex-1 p-2 border rounded" value={nuevoGasto.descripcion} onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})} />
                                  <button onClick={agregarGasto} className="px-6 py-2 bg-slate-800 text-white rounded">Guardar</button>
                              </div>
                          </div>
                          )}

                          <div className="divide-y divide-slate-100">
                          {seccionesGastos.map(seccion => 
                              seccion.subsecciones.map(sub => 
                                  sub.gastos.filter(g => g.mes === mesSeleccionado).map(gasto => (
                                      <div key={gasto.id} className="p-4 flex justify-between hover:bg-slate-50 group">
                                          <div className="flex gap-3">
                                              <div>
                                                  <p className="font-medium text-slate-800">{sub.nombre} <span className="text-slate-400">| {gasto.descripcion}</span></p>
                                                  <p className="text-xs text-slate-500">{personas.find(p => p.id === gasto.personaId)?.nombre} • {gasto.fecha}</p>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-4">
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
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Balance Individual</h3>
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
                                      <span>Ing: {formatearMoneda(ing)}</span>
                                      <span>Gas: {formatearMoneda(gas)}</span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución de Gastos</h3>
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
                      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No hay datos</div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}