export const formatDateSpanish = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const datePart = dateStr.split('T')[0].replace(/\.+$/, '').trim();
    let parts: string[] = [];
    if (datePart.includes('-')) {
      parts = datePart.split('-');
    } else if (datePart.includes('/')) {
      parts = datePart.split('/');
    } else if (datePart.includes('.')) {
      parts = datePart.split('.');
    }
    
    if (parts.length !== 3) return dateStr;
    
    let year = parts[0];
    let monthIndex = parseInt(parts[1], 10) - 1;
    let day = parseInt(parts[2], 10);

    if (year.length < 4) {
      if (parts[2].length === 4) {
        year = parts[2];
        day = parseInt(parts[0], 10);
      } else {
        return dateStr;
      }
    }

    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    if (monthIndex < 0 || monthIndex >= 12 || isNaN(day) || isNaN(monthIndex)) {
      return dateStr;
    }

    return `${day} de ${months[monthIndex]} de ${year}`;
  } catch {
    return dateStr;
  }
};

export const getFechaConciliacion = (fechaCapitalizacion?: string, fechaTerminoCampo?: string): string => {
  if (!fechaCapitalizacion) return '';
  if (!fechaTerminoCampo) return fechaCapitalizacion;

  try {
    const parseDate = (str: string): Date | null => {
      const datePart = str.split('T')[0].replace(/\.+$/, '').trim();
      let parts: string[] = [];
      if (datePart.includes('-')) {
        parts = datePart.split('-');
      } else if (datePart.includes('/')) {
        parts = datePart.split('/');
      } else if (datePart.includes('.')) {
        parts = datePart.split('.');
      }
      if (parts.length !== 3) return null;
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10) - 1;
      let d = parseInt(parts[2], 10);

      if (y < 100) {
        if (parts[2].length === 4) {
          y = parseInt(parts[2], 10);
          d = parseInt(parts[0], 10);
        } else {
          return null;
        }
      }
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    };

    const capDate = parseDate(fechaCapitalizacion);
    const termDate = parseDate(fechaTerminoCampo);

    if (!capDate) return fechaCapitalizacion;
    if (!termDate) return fechaCapitalizacion;

    const diffTime = capDate.getTime() - termDate.getTime();
    const R = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let resultDate: Date;
    if (R > 20) {
      resultDate = new Date(termDate.getTime());
      resultDate.setDate(resultDate.getDate() + 19);
    } else {
      resultDate = capDate;
    }

    const yyyy = resultDate.getFullYear();
    const mm = String(resultDate.getMonth() + 1).padStart(2, '0');
    const dd = String(resultDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return fechaCapitalizacion;
  }
};
