import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, DollarSign, Download, Upload } from 'lucide-react';

export default function ContabilidadFamiliar() {
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const COLORES_DISPONIBLES = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C67A'
  ];

  const [vistaActual, setVistaActual] = useState('anual');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  
  // Estados principales de datos
  const [personas, setPersonas] = useState([]);
  const [seccionesIngresos, setSeccionesIngresos] = useState([]);
  const [seccionesGastos, setSeccionesGastos] = useState([]);
  const [ingresos, setIngresos] = useState({});
  
  // Estados de interfaz
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [nuevaPersona, setNuevaPersona] = useState({ nombre: '', color: COLORES_DISPONIBLES[0] });
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    seccionId: '',
    subseccionId: '',
    personaId: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Carga inicial desde LocalStorage
  useEffect(() => {
    const datosGuardados = localStorage.getItem('familia-datos-2026');
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        setPersonas(datos.personas || []);
        setSeccionesIngresos(datos.seccionesIngresos || []);
        setSeccionesGastos(datos.seccionesGastos || []);
        setIngresos(datos.ingresos || {});
      } catch (error) {
        console.error("Error al cargar datos locales", error);
      }
    }
  }, []);

  // Guardado automático en LocalStorage cada vez que algo cambia
  useEffect(() => {
    if (personas.length > 0) {
      const estadoActual = {
        personas,
        seccionesIngresos,
        seccionesGastos,
        ingresos,
        ultimaModificacion: new Date().toISOString()
      };
      localStorage.setItem('familia-datos-2026', JSON.stringify(estadoActual));
    }
  }, [personas, seccionesIngresos, seccionesGastos, ingresos]);

  // --- FUNCIONES DE RESPALDO MANUAL (IMPORTAR/EXPORTAR) ---

  const exportarDatos = () => {
    const datos = {
      personas,
      seccionesIngresos,
      seccionesGastos,
      ingresos,
      fechaExportacion: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datos));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "contabilidad_familiar_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importarDatos = (event) => {
    const fileReader = new FileReader();
    if(event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        try {
          const datos = JSON.parse(e.target.result);
          if (datos.personas && Array.isArray(datos.personas)) {
            setPersonas(datos.personas);
            setSeccionesIngresos(datos.seccionesIngresos || []);
            setSeccionesGastos(datos.seccionesGastos || []);
            setIngresos(datos.ingresos || {});
            alert('Datos importados correctamente');
            setMostrarConfiguracion(false); // Regresar a la vista principal
          } else {
            alert('El archivo no tiene el formato correcto');
          }
        } catch (error) {
          alert('Error al leer el archivo');
        }
      };
    }
  };

  // --- CÁLCULOS (Lógica de negocio) ---

  const calcularIngresosPersona = (personaId, mes = null) => {
    let total = 0;
    Object.keys(ingresos).forEach(key => {
      if (key.startsWith(personaId)) {
        const [, mesKey] = key.split('-');
        if (mes === null || parseInt(mesKey) === mes) {
          total += ingresos[key] || 0;
        }
      }
    });
    return total;
  };

  const calcularGastosPersona = (personaId, mes = null) => {
    let total = 0;
    seccionesGastos.forEach(seccion => {
      seccion.subsecciones.forEach(subseccion => {
        subseccion.gastos.forEach(gasto => {
          if (gasto.personaId === personaId && (mes === null || gasto.mes === mes)) {
            total += gasto.monto;
          }
        });
      });
    });
    return total;
  };

  const calcularIngresosFamilia = (mes = null) => {
    return personas.reduce((total, persona) => total + calcularIngresosPersona(persona.id, mes), 0);
  };

  const calcularGastosFamilia = (mes = null) => {
    let total = 0;
    seccionesGastos.forEach(seccion => {
      seccion.subsecciones.forEach(subseccion => {
        subseccion.gastos.forEach(gasto => {
          if (mes === null || gasto.mes === mes) {
            total += gasto.monto;
          }
        });
      });
    });
    return total;
  };

  const calcularGastosPorCategoria = (mes = null) => {
    const gastosPorCategoria = {};
    seccionesGastos.forEach(seccion => {
      gastosPorCategoria[seccion.nombre] = 0;
      seccion.subsecciones.forEach(subseccion => {
        subseccion.gastos.forEach(gasto => {
          if (mes === null || gasto.mes === mes) {
            gastosPorCategoria[seccion.nombre] += gasto.monto;
          }
        });
      });
    });
    return gastosPorCategoria;
  };

  const generarDatosGraficaAnual = () => {
    return MESES.map((mes, index) => ({
      mes: mes.substring(0, 3),
      ingresos: calcularIngresosFamilia(index),
      gastos: calcularGastosFamilia(index)
    }));
  };

  const generarDatosGraficaCategoria = (mes = null) => {
    const gastosPorCategoria = calcularGastosPorCategoria(mes);
    return Object.entries(gastosPorCategoria)
      .filter(([, valor]) => valor > 0)
      .map(([nombre, valor]) => ({ nombre, valor }));
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  // --- GESTIÓN DE DATOS (Agregar/Eliminar) ---

  const agregarPersona = () => {
    if (nuevaPersona.nombre.trim()) {
      setPersonas([...personas, {
        id: Date.now().toString(),
        nombre: nuevaPersona.nombre,
        color: nuevaPersona.color
      }]);
      setNuevaPersona({ nombre: '', color: COLORES_DISPONIBLES[0] });
    }
  };

  const eliminarPersona = (id) => setPersonas(personas.filter(p => p.id !== id));

  const agregarSeccionIngreso = () => {
    setSeccionesIngresos([...seccionesIngresos, {
      id: Date.now().toString(),
      nombre: 'Nueva Sección',
      subsecciones: []
    }]);
  };

  const agregarSubseccionIngreso = (seccionId) => {
    setSeccionesIngresos(seccionesIngresos.map(seccion => 
      seccion.id === seccionId ? {
        ...seccion,
        subsecciones: [...seccion.subsecciones, {
          id: Date.now().toString(),
          nombre: 'Concepto'
        }]
      } : seccion
    ));
  };

  const actualizarIngresoMensual = (personaId, subseccionId, mes, valor) => {
    const key = `${personaId}-${mes}-${subseccionId}`;
    setIngresos({ ...ingresos, [key]: parseFloat(valor) || 0 });
  };

  const agregarSeccionGasto = () => {
    setSeccionesGastos([...seccionesGastos, {
      id: Date.now().toString(),
      nombre: 'Nueva Categoría',
      color: COLORES_DISPONIBLES[seccionesGastos.length % COLORES_DISPONIBLES.length],
      subsecciones: []
    }]);
  };

  const agregarSubseccionGasto = (seccionId) => {
    setSeccionesGastos(seccionesGastos.map(seccion => 
      seccion.id === seccionId ? {
        ...seccion,
        subsecciones: [...seccion.subsecciones, {
          id: Date.now().toString(),
          nombre: 'Subcategoría',
          gastos: []
        }]
      } : seccion
    ));
  };

  const agregarGasto = () => {
    if (!nuevoGasto.seccionId || !nuevoGasto.subseccionId || !nuevoGasto.personaId || !nuevoGasto.monto) {
      alert('Completa todos los campos');
      return;
    }

    const gasto = {
      id: Date.now().toString(),
      personaId: nuevoGasto.personaId,
      monto: parseFloat(nuevoGasto.monto),
      descripcion: nuevoGasto.descripcion,
      fecha: nuevoGasto.fecha,
      mes: mesSeleccionado
    };

    setSeccionesGastos(seccionesGastos.map(seccion => 
      seccion.id === nuevoGasto.seccionId ? {
        ...seccion,
        subsecciones: seccion.subsecciones.map(subseccion =>
          subseccion.id === nuevoGasto.subseccionId ? {
            ...subseccion,
            gastos: [...subseccion.gastos, gasto]
          } : subseccion
        )
      } : seccion
    ));

    setNuevoGasto({
      seccionId: '',
      subseccionId: '',
      personaId: '',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormGasto(false);
  };

  const eliminarGasto = (seccionId, subseccionId, gastoId) => {
    setSeccionesGastos(seccionesGastos.map(seccion =>
      seccion.id === seccionId ? {
        ...seccion,
        subsecciones: seccion.subsecciones.map(subseccion =>
          subseccion.id === subseccionId ? {
            ...subseccion,
            gastos: subseccion.gastos.filter(g => g.id !== gastoId)
          } : subseccion
        )
      } : seccion
    ));
  };

  // --- VISTAS ---

  if (personas.length === 0 && !mostrarConfiguracion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-slate-200 max-w-lg w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-blue-200 shadow-xl">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido</h1>
              <p className="text-slate-500">Comienza agregando a los miembros de la familia o carga un respaldo anterior.</p>
            </div>

            <div className="space-y-4">
               {/* Sección para agregar primera persona */}
               <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. Papá)"
                    value={nuevaPersona.nombre}
                    onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    onClick={agregarPersona}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Agregar
                  </button>
               </div>
               
               <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">O recupera tus datos</span></div>
               </div>

               {/* Botón de importar respaldo */}
               <label className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all gap-2 text-slate-600 hover:text-blue-600">
                  <Upload className="w-5 h-5" />
                  <span>Cargar archivo de Respaldo (.json)</span>
                  <input type="file" onChange={importarDatos} className="hidden" accept=".json" />
               </label>
            </div>
        </div>
      </div>
    );
  }

  if (mostrarConfiguracion) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header de Configuración con Botones de Exportar/Importar */}
          <div className="bg-slate-800 text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Configuración</h1>
                    <p className="text-slate-400">Gestiona categorías, miembros y respaldos</p>
                </div>
                <button
                onClick={() => setMostrarConfiguracion(false)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors backdrop-blur-sm"
                >
                Guardar y Salir
                </button>
            </div>
            
            <div className="flex gap-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                <button onClick={exportarDatos} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors text-white">
                    <Download className="w-4 h-4" /> Exportar Respaldo
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors text-white cursor-pointer">
                    <Upload className="w-4 h-4" /> Importar Respaldo
                    <input type="file" onChange={importarDatos} className="hidden" accept=".json" />
                </label>
                <div className="ml-auto text-xs text-slate-400 max-w-xs text-right leading-tight">
                    Utiliza estos botones para mover tu información entre dispositivos manualmente.
                </div>
            </div>
          </div>

          <div className="p-8 space-y-12">
            
            {/* Gestión de Personas */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-1 bg-blue-500 rounded-full"></div> Miembros
                </h2>
                <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Nuevo Miembro</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={nuevaPersona.nombre}
                            onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input 
                            type="color" 
                            value={nuevaPersona.color}
                            onChange={(e) => setNuevaPersona({ ...nuevaPersona, color: e.target.value })}
                            className="h-11 w-12 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"
                        />
                        <button onClick={agregarPersona} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-slate-200 my-2 md:hidden"></div>

                  <div className="flex flex-wrap gap-3">
                    {personas.map(persona => (
                      <div key={persona.id} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: persona.color }} />
                        <span className="font-medium text-slate-700">{persona.nombre}</span>
                        <button onClick={() => eliminarPersona(persona.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
            </section>

            {/* Configuración de Ingresos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <div className="w-8 h-1 bg-green-500 rounded-full"></div> Ingresos Recurrentes (Mensuales)
                </h2>
                <button onClick={agregarSeccionIngreso} className="text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium flex gap-1 items-center">
                  <Plus className="w-4 h-4" /> Nueva Sección
                </button>
              </div>

              {seccionesIngresos.map(seccion => (
                <div key={seccion.id} className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex gap-4 items-center">
                    <input
                      type="text"
                      value={seccion.nombre}
                      onChange={(e) => setSeccionesIngresos(seccionesIngresos.map(s => s.id === seccion.id ? { ...s, nombre: e.target.value } : s))}
                      className="font-bold text-lg bg-transparent border-none focus:ring-0 text-slate-700 w-full"
                    />
                    <button onClick={() => agregarSubseccionIngreso(seccion.id)} className="shrink-0 text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50">
                        + Concepto
                    </button>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {/* AQUÍ ESTABA EL ERROR: 'seccion.subsecciones' en lugar de 'secciones.subsecciones' */}
                    {seccion.subsecciones?.length === 0 && <p className="text-sm text-slate-400 italic">Agrega conceptos (ej. Sueldo, Rentas)...</p>}
                    
                    {seccionesIngresos.find(s => s.id === seccion.id)?.subsecciones.map(subseccion => (
                      <div key={subseccion.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                        <input
                          type="text"
                          value={subseccion.nombre}
                          onChange={(e) => {
                            setSeccionesIngresos(seccionesIngresos.map(s => 
                              s.id === seccion.id ? {
                                ...s,
                                subsecciones: s.subsecciones.map(sub =>
                                  sub.id === subseccion.id ? { ...sub, nombre: e.target.value } : sub
                                )
                              } : s
                            ));
                          }}
                          className="w-full md:w-48 font-medium text-slate-600 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                        />
                        
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                          {personas.map(persona => (
                            <div key={persona.id} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-100">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: persona.color }} />
                              <span className="text-xs text-slate-500 truncate w-16">{persona.nombre}</span>
                              <div className="flex items-center ml-auto">
                                <span className="text-slate-400 text-xs mr-1">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={ingresos[`${persona.id}-${mesSeleccionado}-${subseccion.id}`] || ''}
                                    onChange={(e) => actualizarIngresoMensual(persona.id, subseccion.id, mesSeleccionado, e.target.value)}
                                    className="w-20 text-right text-sm outline-none font-medium text-slate-700"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Configuración de Gastos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <div className="w-8 h-1 bg-red-500 rounded-full"></div> Categorías de Gastos
                </h2>
                <button onClick={agregarSeccionGasto} className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium flex gap-1 items-center">
                  <Plus className="w-4 h-4" /> Nueva Categoría
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seccionesGastos.map(seccion => (
                    <div key={seccion.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-3 flex items-center gap-3" style={{ backgroundColor: seccion.color + '20' }}>
                        <div className="w-6 h-6 rounded border border-black/10" style={{ backgroundColor: seccion.color }} />
                        <input
                        type="text"
                        value={seccion.nombre}
                        onChange={(e) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccion.id ? { ...s, nombre: e.target.value } : s))}
                        className="font-bold text-slate-800 bg-transparent outline-none flex-1"
                        />
                        <button onClick={() => agregarSubseccionGasto(seccion.id)} className="p-1 hover:bg-black/5 rounded">
                            <Plus className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                    <div className="p-3 bg-white space-y-2">
                        {seccion.subsecciones.map(subseccion => (
                        <div key={subseccion.id} className="flex items-center px-3 py-2 bg-slate-50 rounded border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></div>
                            <input
                            type="text"
                            value={subseccion.nombre}
                            onChange={(e) => setSeccionesGastos(seccionesGastos.map(s => s.id === seccion.id ? { ...s, subsecciones: s.subsecciones.map(sub => sub.id === subseccion.id ? { ...sub, nombre: e.target.value } : sub) } : s))}
                            className="bg-transparent outline-none w-full text-sm text-slate-600"
                            />
                        </div>
                        ))}
                        {seccion.subsecciones.length === 0 && <p className="text-xs text-center text-slate-400 py-2">Sin subcategorías</p>}
                    </div>
                    </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    );
  }

  // Vista Principal (Dashboard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      {/* Navbar Simple */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">Finanzas</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">FAMILIARES</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarConfiguracion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
            >
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controles de Vista y Mes */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setVistaActual('anual')}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                vistaActual === 'anual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resumen Anual
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            {MESES.map((mes, index) => (
              <button
                key={mes}
                onClick={() => {
                  setVistaActual('mensual');
                  setMesSeleccionado(index);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  vistaActual === 'mensual' && mesSeleccionado === index
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Ingresos Totales</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-600">
                        {formatearMoneda(vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado))}
                    </span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Gastos Totales</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-rose-600">
                        {formatearMoneda(vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado))}
                    </span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Ahorro Neto</p>
                <div className="flex items-baseline gap-2">
                     {(() => {
                        const ing = vistaActual === 'anual' ? calcularIngresosFamilia() : calcularIngresosFamilia(mesSeleccionado);
                        const gas = vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado);
                        const balance = ing - gas;
                        return (
                            <span className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                                {formatearMoneda(balance)}
                            </span>
                        );
                     })()}
                </div>
            </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda: Gráfica y Desglose por Persona */}
            <div className="lg:col-span-2 space-y-8">
                {/* Gráfica */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Comportamiento Financiero</h3>
                    <div className="h-72 w-full">
                        {vistaActual === 'anual' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={generarDatosGraficaAnual()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                                <p>Vista mensual detallada abajo 👇</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Gastos (Solo visible en modo mensual) */}
                {vistaActual === 'mensual' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Registro de Gastos ({MESES[mesSeleccionado]})</h3>
                            <button onClick={() => setMostrarFormGasto(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-200 text-sm font-medium transition-all flex gap-2 items-center">
                                <Plus className="w-4 h-4" /> Agregar Gasto
                            </button>
                        </div>
                        
                        {mostrarFormGasto && (
                           <div className="p-6 bg-blue-50 border-b border-blue-100">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                 {/* Formulario de Gasto Simplificado */}
                                 <select 
                                    className="p-2 border rounded-lg"
                                    value={nuevoGasto.seccionId}
                                    onChange={(e) => setNuevoGasto({...nuevoGasto, seccionId: e.target.value, subseccionId: ''})}
                                 >
                                    <option value="">Categoría...</option>
                                    {seccionesGastos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                 </select>

                                 <select 
                                    className="p-2 border rounded-lg"
                                    disabled={!nuevoGasto.seccionId}
                                    value={nuevoGasto.subseccionId}
                                    onChange={(e) => setNuevoGasto({...nuevoGasto, subseccionId: e.target.value})}
                                 >
                                    <option value="">Subcategoría...</option>
                                    {seccionesGastos.find(s => s.id === nuevoGasto.seccionId)?.subsecciones.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                    ))}
                                 </select>

                                 <select 
                                    className="p-2 border rounded-lg"
                                    value={nuevoGasto.personaId}
                                    onChange={(e) => setNuevoGasto({...nuevoGasto, personaId: e.target.value})}
                                 >
                                    <option value="">Quién pagó...</option>
                                    {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                 </select>

                                 <input 
                                    type="number" 
                                    placeholder="Monto"
                                    className="p-2 border rounded-lg"
                                    value={nuevoGasto.monto}
                                    onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                                 />
                              </div>
                              <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Descripción (opcional)" 
                                    className="flex-1 p-2 border rounded-lg"
                                    value={nuevoGasto.descripcion}
                                    onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                                />
                                <button onClick={agregarGasto} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">Guardar</button>
                                <button onClick={() => setMostrarFormGasto(false)} className="px-4 py-2 bg-white text-slate-600 rounded-lg">Cancelar</button>
                              </div>
                           </div>
                        )}

                        <div className="divide-y divide-slate-100">
                           {seccionesGastos.map(seccion => 
                              seccion.subsecciones.map(sub => 
                                 sub.gastos.filter(g => g.mes === mesSeleccionado).map(gasto => {
                                    const persona = personas.find(p => p.id === gasto.personaId);
                                    return (
                                        <div key={gasto.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{backgroundColor: seccion.color + '20', color: seccion.color}}>
                                                    {seccion.nombre.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{sub.nombre} <span className="font-normal text-slate-400 text-sm">| {gasto.descripcion}</span></p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: persona?.color}} />
                                                            {persona?.nombre}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{gasto.fecha}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-slate-700">{formatearMoneda(gasto.monto)}</span>
                                                <button onClick={() => eliminarGasto(seccion.id, sub.id, gasto.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                 })
                              )
                           )}
                           {calcularGastosFamilia(mesSeleccionado) === 0 && (
                                <div className="p-12 text-center text-slate-400">
                                    No hay gastos registrados en este mes.
                                </div>
                           )}
                        </div>
                    </div>
                )}
            </div>

            {/* Columna Derecha: Resumen por Persona y Categorías */}
            <div className="space-y-6">
                
                {/* Tarjeta de Balance por Persona */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Balance Individual</h3>
                    <div className="space-y-4">
                        {personas.map(persona => {
                            const ing = vistaActual === 'anual' ? calcularIngresosPersona(persona.id) : calcularIngresosPersona(persona.id, mesSeleccionado);
                            const gas = vistaActual === 'anual' ? calcularGastosPersona(persona.id) : calcularGastosPersona(persona.id, mesSeleccionado);
                            const percent = ing > 0 ? (gas / ing) * 100 : 0;
                            
                            return (
                                <div key={persona.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: persona.color}} />
                                            <span className="font-medium text-slate-700">{persona.nombre}</span>
                                        </div>
                                        <span className={`text-sm font-bold ${ing - gas >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
                                            {formatearMoneda(ing - gas)}
                                        </span>
                                    </div>
                                    <div className="flex text-xs text-slate-500 justify-between mb-1">
                                        <span>Ing: {formatearMoneda(ing)}</span>
                                        <span>Gas: {formatearMoneda(gas)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${Math.min(percent, 100)}%`, 
                                                backgroundColor: percent > 90 ? '#ef4444' : persona.color 
                                            }} 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Gráfica de Categorías (Pie) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución de Gastos</h3>
                    {generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null).length > 0 ? (
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null)}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="valor"
                                    >
                                        {generarDatosGraficaCategoria(vistaActual === 'mensual' ? mesSeleccionado : null).map((entry, index) => {
                                            const seccion = seccionesGastos.find(s => s.nombre === entry.nombre);
                                            return <Cell key={`cell-${index}`} fill={seccion?.color || COLORES_DISPONIBLES[index]} />;
                                        })}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatearMoneda(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-xs text-slate-400 block">Total</span>
                                    <span className="font-bold text-slate-700">
                                        {formatearMoneda(vistaActual === 'anual' ? calcularGastosFamilia() : calcularGastosFamilia(mesSeleccionado))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 text-sm italic">
                            No hay datos para mostrar
                        </div>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}