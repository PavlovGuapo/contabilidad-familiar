import { useState, useEffect } from 'react';

export function useFinanzas() {
  const COLORES_DISPONIBLES = [
    '#475569', '#64748b', '#94a3b8', '#52525b', '#71717a',
    '#a1a1aa', '#57534e', '#78716c', '#a8a29e', '#1e293b'
  ];
  const ANIO_ACTUAL = new Date().getFullYear();

  const [personas, setPersonas] = useState([]);
  const [seccionesIngresos, setSeccionesIngresos] = useState([]);
  const [seccionesGastos, setSeccionesGastos] = useState([]);
  const [ingresos, setIngresos] = useState({});
  const [gastosFijos, setGastosFijos] = useState([]);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('familia-datos-2026');
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        setPersonas(datos.personas || []);
        setSeccionesIngresos(datos.seccionesIngresos || []);
        setSeccionesGastos(datos.seccionesGastos || []);
        setIngresos(datos.ingresos || {});
        setGastosFijos(datos.gastosFijos || []);
      } catch (error) {
        console.error("Error al cargar datos locales", error);
      }
    }
  }, []);

  useEffect(() => {
    if (personas.length > 0) {
      localStorage.setItem('familia-datos-2026', JSON.stringify({
        personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos, ultimaModificacion: new Date().toISOString()
      }));
    }
  }, [personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos]);

  const exportarDatos = () => {
    const datos = { personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos, fechaExportacion: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datos));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "contabilidad_neutra_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importarDatos = (event, callbackExito) => {
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
            setGastosFijos(datos.gastosFijos || []);
            if(callbackExito) callbackExito();
          }
        } catch (error) {
          alert('Error al leer el archivo');
        }
      };
    }
  };

  const aplicaGastoFijoEnMes = (gasto, mesEvaluar, anioEvaluar = ANIO_ACTUAL) => {
    const fecha = new Date(gasto.fechaInicio + 'T00:00:00');
    const mesInicio = fecha.getMonth();
    const anioInicio = fecha.getFullYear();
    const diferenciaMeses = (anioEvaluar - anioInicio) * 12 + (mesEvaluar - mesInicio);
    return diferenciaMeses >= 0 && diferenciaMeses % parseInt(gasto.periodicidadMeses) === 0;
  };

  const calcularIngresosPersona = (personaId, mes = null) => {
    let total = 0;
    Object.keys(ingresos).forEach(key => {
      if (key.startsWith(personaId)) {
        const [, mesKey] = key.split('-');
        if (mes === null || parseInt(mesKey) === mes) total += ingresos[key] || 0;
      }
    });
    return total;
  };

  const calcularGastosPersona = (personaId, mes = null) => {
    let total = 0;
    seccionesGastos.forEach(seccion => {
      seccion.subsecciones.forEach(sub => {
        sub.gastos.forEach(gasto => {
          if (gasto.personaId === personaId && (mes === null || gasto.mes === mes)) total += gasto.monto;
        });
      });
    });
    gastosFijos.forEach(gasto => {
      if (gasto.personaId === personaId) {
        if (mes === null) {
          for(let m = 0; m < 12; m++) if(aplicaGastoFijoEnMes(gasto, m)) total += gasto.monto;
        } else {
          if(aplicaGastoFijoEnMes(gasto, mes)) total += gasto.monto;
        }
      }
    });
    return total;
  };

  const calcularIngresosFamilia = (mes = null) => personas.reduce((t, p) => t + calcularIngresosPersona(p.id, mes), 0);
  const calcularGastosFamilia = (mes = null) => personas.reduce((t, p) => t + calcularGastosPersona(p.id, mes), 0);

  const calcularGastosPorCategoria = (mes = null) => {
    const gastosCat = {};
    seccionesGastos.forEach(seccion => {
      gastosCat[seccion.nombre] = 0;
      seccion.subsecciones.forEach(sub => {
        sub.gastos.forEach(g => {
          if (mes === null || g.mes === mes) gastosCat[seccion.nombre] += g.monto;
        });
      });
    });
    gastosCat['Gastos Fijos'] = 0;
    gastosFijos.forEach(g => {
      if (mes === null) {
        for(let m = 0; m < 12; m++) if(aplicaGastoFijoEnMes(g, m)) gastosCat['Gastos Fijos'] += g.monto;
      } else {
        if(aplicaGastoFijoEnMes(g, mes)) gastosCat['Gastos Fijos'] += g.monto;
      }
    });
    return gastosCat;
  };

  const formatearMoneda = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);

  return {
    COLORES_DISPONIBLES, ANIO_ACTUAL,
    personas, setPersonas, seccionesIngresos, setSeccionesIngresos,
    seccionesGastos, setSeccionesGastos, ingresos, setIngresos,
    gastosFijos, setGastosFijos,
    exportarDatos, importarDatos, aplicaGastoFijoEnMes, formatearMoneda,
    calcularIngresosPersona, calcularGastosPersona, calcularIngresosFamilia,
    calcularGastosFamilia, calcularGastosPorCategoria
  };
}