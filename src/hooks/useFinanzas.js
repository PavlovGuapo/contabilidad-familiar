import { useState, useEffect } from 'react';

export function useFinanzas() {
  const COLORES_DISPONIBLES = ['#475569', '#64748b', '#94a3b8', '#52525b', '#71717a', '#a1a1aa', '#57534e', '#78716c', '#a8a29e', '#1e293b'];
  const ANIO_ACTUAL = new Date().getFullYear();

  const diccionarios = {
    es: {
      boveda_cifrada: 'Bóveda Cifrada', ingresa_pass: 'Ingresa tu contraseña para desencriptar los datos locales.',
      pass_maestra: 'Contraseña maestra', pass_incorrecta: 'Contraseña incorrecta o datos corruptos.',
      desbloquear: 'Desbloquear', bienvenido: 'Bienvenido', configurar_familia: 'Configurar Nueva Familia',
      cargar_respaldo: 'Cargar Respaldo', finanzas: 'Finanzas', cifrado_activo: 'Cifrado Activo',
      configuracion: 'Configuración', resumen_anual: 'Resumen Anual', ingresos_totales: 'Ingresos Totales',
      gastos_totales: 'Gastos Totales', balance_neto: 'Balance Neto', comportamiento_financiero: 'Comportamiento Financiero',
      vista_mensual_abajo: 'Vista mensual detallada abajo', gastos_variables: 'Gastos Variables', agregar_gasto_variable: 'Agregar Gasto Variable',
      categoria: 'Categoría...', subcategoria: 'Subcategoría...', quien_pago: 'Quién pagó...', quien_paga: 'Quién paga...',
      monto: 'Monto', descripcion: 'Descripción', guardar: 'Guardar', balance_individual: 'Balance Individual',
      ing: 'Ing:', gas: 'Gas:', metas_ahorro: 'Metas de Ahorro', meta: 'Meta:', aportar: 'Aportar',
      control_presupuestos: 'Control de Presupuestos', no_limites: 'No hay límites configurados', distribucion_gastos: 'Distribución de Gastos',
      no_datos: 'No hay datos', no_metas: 'No hay metas configuradas', respaldo_json: 'Respaldo JSON', importar: 'Importar',
      exportar_csv: 'Exportar Gastos CSV', seguridad_local: 'Seguridad Local', cifrado_almacenamiento: 'Cifrado de Almacenamiento',
      cifrado_desc1: 'Los datos se encriptan al salir de la aplicación.', cifrado_desc2: 'Tus datos son legibles en el navegador.',
      nueva_pass: 'Nueva contraseña...', crear_pass: 'Crear contraseña...', actualizar: 'Actualizar', activar: 'Activar',
      quitar: 'Quitar', miembros: 'Miembros', nombre: 'Nombre', gastos_fijos: 'Gastos Fijos', primer_cobro: 'Primer cobro:',
      mensual: 'Mensual', bimestral: 'Bimestral', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual',
      inicia: 'Inicia:', cada: 'Cada', meses: 'mes(es)', monto_objetivo: 'Monto objetivo', nombre_meta: 'Nombre de la meta',
      ingresos_categorias: 'Ingresos y Categorías', nueva_seccion_ingreso: 'Nueva Sección Ingreso', nueva_categoria_gasto: 'Nueva Categoría Gasto',
      ingresos: 'Ingresos', concepto: 'Concepto', guardar_salir: 'Guardar y Salir', calendario_fijos: 'Calendario de Gastos Fijos',
      tope: 'Tope: $', dom: 'Dom', lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb'
    },
    en: {
      boveda_cifrada: 'Encrypted Vault', ingresa_pass: 'Enter your password to decrypt local data.',
      pass_maestra: 'Master password', pass_incorrecta: 'Incorrect password or corrupted data.',
      desbloquear: 'Unlock', bienvenido: 'Welcome', configurar_familia: 'Setup New Family',
      cargar_respaldo: 'Load Backup', finanzas: 'Finance', cifrado_activo: 'Encryption Active',
      configuracion: 'Settings', resumen_anual: 'Yearly Summary', ingresos_totales: 'Total Income',
      gastos_totales: 'Total Expenses', balance_neto: 'Net Balance', comportamiento_financiero: 'Financial Behavior',
      vista_mensual_abajo: 'Detailed monthly view below', gastos_variables: 'Variable Expenses', agregar_gasto_variable: 'Add Variable Expense',
      categoria: 'Category...', subcategoria: 'Subcategory...', quien_pago: 'Who paid...', quien_paga: 'Who pays...',
      monto: 'Amount', descripcion: 'Description', guardar: 'Save', balance_individual: 'Individual Balance',
      ing: 'Inc:', gas: 'Exp:', metas_ahorro: 'Savings Goals', meta: 'Goal:', aportar: 'Contribute',
      control_presupuestos: 'Budget Control', no_limites: 'No limits configured', distribucion_gastos: 'Expense Distribution',
      no_datos: 'No data', no_metas: 'No goals configured', respaldo_json: 'JSON Backup', importar: 'Import',
      exportar_csv: 'Export CSV Expenses', seguridad_local: 'Local Security', cifrado_almacenamiento: 'Storage Encryption',
      cifrado_desc1: 'Data is encrypted when leaving the application.', cifrado_desc2: 'Your data is readable in the browser.',
      nueva_pass: 'New password...', crear_pass: 'Create password...', actualizar: 'Update', activar: 'Activate',
      quitar: 'Remove', miembros: 'Members', nombre: 'Name', gastos_fijos: 'Fixed Expenses', primer_cobro: 'First charge:',
      mensual: 'Monthly', bimestral: 'Bimonthly', trimestral: 'Quarterly', semestral: 'Biannual', anual: 'Annual',
      inicia: 'Starts:', cada: 'Every', meses: 'month(s)', monto_objetivo: 'Target amount', nombre_meta: 'Goal name',
      ingresos_categorias: 'Income & Categories', nueva_seccion_ingreso: 'New Income Section', nueva_categoria_gasto: 'New Expense Category',
      ingresos: 'Income', concepto: 'Concept', guardar_salir: 'Save & Exit', calendario_fijos: 'Fixed Expenses Calendar',
      tope: 'Limit: $', dom: 'Sun', lun: 'Mon', mar: 'Tue', mie: 'Wed', jue: 'Thu', vie: 'Fri', sab: 'Sat'
    }
  };

  const [idioma, setIdioma] = useState('es');
  const [isLocked, setIsLocked] = useState(false);
  const [passwordActual, setPasswordActual] = useState(null);
  const [errorPassword, setErrorPassword] = useState(false);

  const [personas, setPersonas] = useState([]);
  const [seccionesIngresos, setSeccionesIngresos] = useState([]);
  const [seccionesGastos, setSeccionesGastos] = useState([]);
  const [ingresos, setIngresos] = useState({});
  const [gastosFijos, setGastosFijos] = useState([]);
  const [metasAhorro, setMetasAhorro] = useState([]);

  const t = (clave) => diccionarios[idioma][clave] || clave;
  const alternarIdioma = () => setIdioma(prev => prev === 'es' ? 'en' : 'es');

  const xorCipher = (text, key) => {
    let result = '';
    for(let i = 0; i < text.length; i++) result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return result;
  };

  const cargarDatos = (datosParseados) => {
    setPersonas(datosParseados.personas || []);
    setSeccionesIngresos(datosParseados.seccionesIngresos || []);
    setSeccionesGastos(datosParseados.seccionesGastos || []);
    setIngresos(datosParseados.ingresos || {});
    setGastosFijos(datosParseados.gastosFijos || []);
    setMetasAhorro(datosParseados.metasAhorro || []);
  };

  useEffect(() => {
    const datosGuardados = localStorage.getItem('familia-datos-2026');
    if (datosGuardados) {
      try {
        const json = JSON.parse(datosGuardados);
        if (json.encrypted) {
          setIsLocked(true);
        } else {
          cargarDatos(json);
        }
      } catch (error) {
        console.error("Error al inicializar datos", error);
      }
    }
  }, []);

  useEffect(() => {
    if (personas.length > 0 && !isLocked) {
      const payload = { personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos, metasAhorro, ultimaModificacion: new Date().toISOString() };
      const jsonString = JSON.stringify(payload);
      
      if (passwordActual) {
        const cifrado = btoa(xorCipher(jsonString, passwordActual));
        localStorage.setItem('familia-datos-2026', JSON.stringify({ encrypted: cifrado }));
      } else {
        localStorage.setItem('familia-datos-2026', jsonString);
      }
    }
  }, [personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos, metasAhorro, passwordActual, isLocked]);

  const desbloquearApp = (intentoPassword) => {
    try {
      const datosGuardados = JSON.parse(localStorage.getItem('familia-datos-2026'));
      const descifrado = xorCipher(atob(datosGuardados.encrypted), intentoPassword);
      const datosParseados = JSON.parse(descifrado);
      
      if (datosParseados.personas) {
        setPasswordActual(intentoPassword);
        setIsLocked(false);
        setErrorPassword(false);
        cargarDatos(datosParseados);
      }
    } catch (e) {
      setErrorPassword(true);
    }
  };

  const configurarPassword = (nuevoPassword) => {
    setPasswordActual(nuevoPassword || null);
  };

  const exportarCSV = () => {
    let csv = "Fecha,Categoria,Subcategoria,Descripcion,Monto,Persona\n";
    seccionesGastos.forEach(sec => {
      sec.subsecciones.forEach(sub => {
        sub.gastos.forEach(g => {
          const nombrePersona = personas.find(p => p.id === g.personaId)?.nombre || 'Desconocido';
          csv += `${g.fecha},"${sec.nombre}","${sub.nombre}","${g.descripcion}",${g.monto},"${nombrePersona}"\n`;
        });
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "movimientos_gastos.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportarDatos = () => {
    const datos = { personas, seccionesIngresos, seccionesGastos, ingresos, gastosFijos, metasAhorro, fechaExportacion: new Date().toISOString() };
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
          if (datos.personas) {
            cargarDatos(datos);
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
    const diferenciaMeses = (anioEvaluar - fecha.getFullYear()) * 12 + (mesEvaluar - fecha.getMonth());
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
    seccionesGastos.forEach(sec => sec.subsecciones.forEach(sub => sub.gastos.forEach(g => {
      if (g.personaId === personaId && (mes === null || g.mes === mes)) total += g.monto;
    })));
    gastosFijos.forEach(g => {
      if (g.personaId === personaId) {
        if (mes === null) { for(let m = 0; m < 12; m++) if(aplicaGastoFijoEnMes(g, m)) total += g.monto; } 
        else if(aplicaGastoFijoEnMes(g, mes)) total += g.monto;
      }
    });
    return total;
  };

  const calcularIngresosFamilia = (mes = null) => personas.reduce((t, p) => t + calcularIngresosPersona(p.id, mes), 0);
  const calcularGastosFamilia = (mes = null) => personas.reduce((t, p) => t + calcularGastosPersona(p.id, mes), 0);

  const calcularGastosPorCategoria = (mes = null) => {
    const gastosCat = {};
    seccionesGastos.forEach(sec => {
      gastosCat[sec.nombre] = 0;
      sec.subsecciones.forEach(sub => sub.gastos.forEach(g => {
        if (mes === null || g.mes === mes) gastosCat[sec.nombre] += g.monto;
      }));
    });
    gastosCat['Gastos Fijos'] = 0;
    gastosFijos.forEach(g => {
      if (mes === null) { for(let m = 0; m < 12; m++) if(aplicaGastoFijoEnMes(g, m)) gastosCat['Gastos Fijos'] += g.monto; } 
      else if(aplicaGastoFijoEnMes(g, mes)) gastosCat['Gastos Fijos'] += g.monto;
    });
    return gastosCat;
  };

  const formatearMoneda = (valor) => new Intl.NumberFormat(idioma === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'MXN' }).format(valor);

  return {
    COLORES_DISPONIBLES, ANIO_ACTUAL, isLocked, errorPassword, passwordActual, idioma, t, alternarIdioma,
    personas, setPersonas, seccionesIngresos, setSeccionesIngresos, seccionesGastos, setSeccionesGastos, 
    ingresos, setIngresos, gastosFijos, setGastosFijos, metasAhorro, setMetasAhorro,
    desbloquearApp, configurarPassword, exportarCSV, exportarDatos, importarDatos, aplicaGastoFijoEnMes, formatearMoneda,
    calcularIngresosPersona, calcularGastosPersona, calcularIngresosFamilia, calcularGastosFamilia, calcularGastosPorCategoria
  };
}