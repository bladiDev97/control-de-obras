import { useState } from 'react';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const useAvisoMt = () => {
  const [fechaElaboracion, setFechaElaboracion] = useState(getTodayStr());
  const [municipio, setMunicipio] = useState('Pátzcuaro');
  const [estado, setEstado] = useState('Michoacán');
  const [fechaSuspension, setFechaSuspension] = useState(getTomorrowStr());
  const [horario, setHorario] = useState('10:30 a 17:30');
  const [ubicacion, setUbicacion] = useState('Av. Lazaro C. Col. IMMS');
  const [telefono, setTelefono] = useState('44-37-96-96-62');
  const [supervisorNombre, setSupervisorNombre] = useState('Marcos Bladimir Romero Pérez');
  const [supervisorZona, setSupervisorZona] = useState('Zona Pátzcuaro');

  const cleanEstado = estado.trim().replace(/\.+$/, '');
  const cleanMunicipio = municipio.trim();
  const municipioEstado = cleanMunicipio && cleanEstado 
    ? `${cleanMunicipio}, ${cleanEstado}.`
    : cleanMunicipio 
      ? `${cleanMunicipio}.` 
      : cleanEstado 
        ? `${cleanEstado}.` 
        : '';

  const setMunicipioEstado = (val: string) => {
    if (val.includes(',')) {
      const [m, ...rest] = val.split(',');
      setMunicipio(m.trim());
      setEstado(rest.join(',').trim().replace(/\.+$/, ''));
    } else {
      setMunicipio(val.trim());
    }
  };

  return {
    fechaElaboracion, setFechaElaboracion,
    municipio, setMunicipio,
    estado, setEstado,
    municipioEstado, setMunicipioEstado,
    fechaSuspension, setFechaSuspension,
    horario, setHorario,
    ubicacion, setUbicacion,
    telefono, setTelefono,
    supervisorNombre, setSupervisorNombre,
    supervisorZona, setSupervisorZona
  };
};
