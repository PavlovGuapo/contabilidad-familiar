import React, { useState } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';

export default function Configuracion({ finanzas, cerrarConfiguracion }) {
  const {
    COLORES_DISPONIBLES, personas, setPersonas, seccionesIngresos, setSeccionesIngresos,
    seccionesGastos, setSeccionesGastos, ingresos, setIngresos, gastosFijos, setGastosFijos,
    exportarDatos, importarDatos, formatearMoneda
  } = finanzas;

  const [nuevaPersona, setNuevaPersona] = useState({ nombre: '', color: COLORES_DISPONIBLES[0] });
  const [nuevoGastoFijo, setNuevoGastoFijo] = useState({
    descripcion: '', monto: '', personaId: '', periodicidadMeses: '1', fechaInicio: new Date().toISOString().split('T')[0]
  });

  const agregarPersona = () => {
    if (nuevaPersona.nombre.trim()) {
      setPersonas([...personas, { id: Date.now().toString(), nombre: nuevaPersona.nombre, color: nuevaPersona.color }]);
      setNuevaPersona({ nombre: '', color: COLORES_DISPONIBLES[0] });
    }
  };
  const eliminarPersona = (id) => setPersonas(personas.filter(p => p.id !== id));

  const agregarGastoFijo = () => {
    if(!nuevoGastoFijo.descripcion || !nuevoGastoFijo.monto || !nuevoGastoFijo.personaId) return;
    setGastosFijos([...gastosFijos, { ...nuevoGastoFijo, id: Date.now().toString(), monto: parseFloat(nuevoGastoFijo.monto) }]);
    setNuevoGastoFijo({ descripcion: '', monto: '', personaId: '', periodicidadMeses: '1', fechaInicio: new Date().toISOString().split('T')[0] });
  };
  const eliminarGastoFijo = (id) => setGastosFijos(gastosFijos.filter(g => g.id !== id));

  const agregarSeccionIngreso = () => setSeccionesIngresos([...seccionesIngresos, { id: Date.now().toString(), nombre: 'Nueva Sección', subsecciones: [] }]);
  const agregarSubseccionIngreso = (seccionId) => setSeccionesIngresos(seccionesIngresos.map(s => s.id === seccionId ? { ...s, subsecciones: [...s.subsecciones, { id: Date.now().toString(), nombre: 'Concepto' }] } : s));
  const actualizarIngresoMensual = (personaId, subseccionId, mes, valor) => setIngresos({ ...ingresos, [`${personaId}-${mes}-${subseccionId}`]: parseFloat(valor) || 0 });

  const agregarSeccionGasto = () => setSeccionesGastos([...seccionesGastos, { id: Date.now().toString(), nombre: 'Nueva Categoría', color: COLORES_DISPONIBLES[seccionesGastos.length % COLORES_DISPONIBLES.length], subsecciones: [] }]);
  const agregarSubseccionGasto = (seccionId) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccionId ? { ...s, subsecciones: [...s.subsecciones, { id: Date.now().toString(), nombre: 'Subcategoría', gastos: [] }] } : s));

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-8">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Configuración</h1>
              <button onClick={cerrarConfiguracion} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium">Guardar y Salir</button>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800 rounded-xl">
              <button onClick={exportarDatos} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"><Download className="w-4 h-4" /> Exportar</button>
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm cursor-pointer"><Upload className="w-4 h-4" /> Importar<input type="file" onChange={(e) => importarDatos(e)} className="hidden" accept=".json" /></label>
          </div>
        </div>

        <div className="p-8 space-y-12">
          <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-8 h-1 bg-slate-500 rounded-full"></div> Miembros</h2>
              <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex gap-2">
                      <input type="text" placeholder="Nombre" value={nuevaPersona.nombre} onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none" />
                      <input type="color" value={nuevaPersona.color} onChange={(e) => setNuevaPersona({ ...nuevaPersona, color: e.target.value })} className="h-10 w-12 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer" />
                      <button onClick={agregarPersona} className="p-2 bg-slate-800 text-white rounded-lg"><Plus className="w-6 h-6" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {personas.map(persona => (
                    <div key={persona.id} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: persona.color }} />
                      <span className="font-medium text-slate-700">{persona.nombre}</span>
                      <button onClick={() => eliminarPersona(persona.id)} className="text-slate-400 hover:text-slate-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-8 h-1 bg-slate-500 rounded-full"></div> Gastos Fijos</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <input type="text" placeholder="Descripción" value={nuevoGastoFijo.descripcion} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, descripcion: e.target.value})} className="px-3 py-2 border rounded-lg md:col-span-2" />
                <input type="number" placeholder="Monto" value={nuevoGastoFijo.monto} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, monto: e.target.value})} className="px-3 py-2 border rounded-lg" />
                <select value={nuevoGastoFijo.personaId} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, personaId: e.target.value})} className="px-3 py-2 border rounded-lg">
                  <option value="">Quién paga...</option>
                  {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <select value={nuevoGastoFijo.periodicidadMeses} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, periodicidadMeses: e.target.value})} className="px-3 py-2 border rounded-lg">
                  <option value="1">Mensual</option><option value="2">Bimestral</option><option value="3">Trimestral</option><option value="6">Semestral</option><option value="12">Anual</option>
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <label className="text-sm text-slate-600 font-medium">Primer cobro:</label>
                <input type="date" value={nuevoGastoFijo.fechaInicio} onChange={e => setNuevoGastoFijo({...nuevoGastoFijo, fechaInicio: e.target.value})} className="px-3 py-2 border rounded-lg flex-1 md:flex-none" />
                <button onClick={agregarGastoFijo} className="px-6 py-2 bg-slate-800 text-white rounded-lg ml-auto">Agregar</button>
              </div>
            </div>
            <div className="space-y-2">
              {gastosFijos.map(g => (
                <div key={g.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                  <div>
                    <p className="font-bold text-slate-700">{g.descripcion} <span className="font-normal text-slate-500 ml-2">{formatearMoneda(g.monto)}</span></p>
                    <p className="text-xs text-slate-400">Inicia: {g.fechaInicio} | Cada {g.periodicidadMeses} mes(es)</p>
                  </div>
                  <button onClick={() => eliminarGastoFijo(g.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><div className="w-8 h-1 bg-slate-500 rounded-full"></div> Ingresos y Categorías</h2>
              <div className="flex gap-2">
                <button onClick={agregarSeccionIngreso} className="text-sm px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg">Nueva Sección Ingreso</button>
                <button onClick={agregarSeccionGasto} className="text-sm px-3 py-1.5 bg-slate-200 text-slate-800 rounded-lg">Nueva Categoría Gasto</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700">Ingresos</h3>
                  {seccionesIngresos.map(seccion => (
                    <div key={seccion.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 p-3 flex gap-4 items-center">
                        <input type="text" value={seccion.nombre} onChange={(e) => setSeccionesIngresos(seccionesIngresos.map(s => s.id === seccion.id ? { ...s, nombre: e.target.value } : s))} className="font-bold bg-transparent outline-none w-full" />
                        <button onClick={() => agregarSubseccionIngreso(seccion.id)} className="text-xs px-2 py-1 bg-white border rounded">Concepto</button>
                      </div>
                      <div className="p-3 bg-white space-y-2">
                        {seccion.subsecciones.map(subseccion => (
                          <div key={subseccion.id} className="flex items-center px-3 py-2 bg-slate-50 border rounded">
                            <input type="text" value={subseccion.nombre} onChange={(e) => setSeccionesIngresos(seccionesIngresos.map(s => s.id === seccion.id ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === subseccion.id ? { ...sub, nombre: e.target.value } : sub) } : s))} className="bg-transparent outline-none w-full text-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700">Gastos Variables</h3>
                  {seccionesGastos.map(seccion => (
                    <div key={seccion.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="p-3 flex items-center gap-3 bg-slate-100">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: seccion.color }} />
                          <input type="text" value={seccion.nombre} onChange={(e) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccion.id ? { ...s, nombre: e.target.value } : s))} className="font-bold bg-transparent outline-none flex-1" />
                          <button onClick={() => agregarSubseccionGasto(seccion.id)} className="p-1"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="p-3 bg-white space-y-2">
                          {seccion.subsecciones.map(subseccion => (
                          <div key={subseccion.id} className="flex items-center px-3 py-2 bg-slate-50 border rounded">
                              <input type="text" value={subseccion.nombre} onChange={(e) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccion.id ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === subseccion.id ? { ...sub, nombre: e.target.value } : sub) } : s))} className="bg-transparent outline-none w-full text-sm" />
                          </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}