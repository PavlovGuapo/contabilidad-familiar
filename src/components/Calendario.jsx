import React from 'react';
import { Calendar } from 'lucide-react';

export default function Calendario({ mesSeleccionado, anioActual, gastosFijos, aplicaGastoFijoEnMes, formatearMoneda }) {
  const obtenerDiasDelMes = (mes, anio) => new Date(anio, mes + 1, 0).getDate();
  const obtenerPrimerDiaDelMes = (mes, anio) => new Date(anio, mes, 1).getDay();

  const diasTotal = obtenerDiasDelMes(mesSeleccionado, anioActual);
  const primerDia = obtenerPrimerDiaDelMes(mesSeleccionado, anioActual);
  const dias = Array.from({ length: diasTotal }, (_, i) => i + 1);
  const celdasVacias = Array.from({ length: primerDia }, (_, i) => i);
  const nombreDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const gastosFijosEsteMes = gastosFijos.filter(g => aplicaGastoFijoEnMes(g, mesSeleccionado, anioActual));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5"/> Calendario de Gastos Fijos
      </h3>
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
        {nombreDias.map(dia => (
          <div key={dia} className="bg-slate-100 text-center py-2 text-xs font-semibold text-slate-600">{dia}</div>
        ))}
        {celdasVacias.map(v => <div key={`empty-${v}`} className="bg-white min-h-[80px]"></div>)}
        {dias.map(dia => {
          const gastosDelDia = gastosFijosEsteMes.filter(g => parseInt(g.fechaInicio.split('-')[2]) === dia);
          return (
            <div key={dia} className="bg-white min-h-[80px] p-1 border-t border-slate-100 flex flex-col">
              <span className="text-xs font-medium text-slate-400 p-1">{dia}</span>
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                {gastosDelDia.map(g => (
                  <div key={g.id} className="text-[10px] bg-slate-700 text-white px-1.5 py-0.5 rounded truncate" title={`${g.descripcion} - ${formatearMoneda(g.monto)}`}>
                    {g.descripcion}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}