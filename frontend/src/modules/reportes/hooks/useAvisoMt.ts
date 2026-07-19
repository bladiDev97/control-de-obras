import { useState } from 'react';

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const useAvisoMt = () => {
  const [fechaElaboracion, setFechaElaboracion] = useState(getTodayStr());
  const [municipioEstado, setMunicipioEstado] = useState('Pátzcuaro, Michoacán.');
  const [fechaSuspension, setFechaSuspension] = useState(getTomorrowStr());
  const [horario, setHorario] = useState('10:30 a 17:30');
  const [ubicacion, setUbicacion] = useState('Av. Lazaro C. Col. IMMS');
  const [telefono, setTelefono] = useState('44-37-96-96-62');
  const [supervisorNombre, setSupervisorNombre] = useState('Marcos Bladimir Romero Pérez');
  const [supervisorZona, setSupervisorZona] = useState('Zona Pátzcuaro');

  return {
    fechaElaboracion, setFechaElaboracion,
    municipioEstado, setMunicipioEstado,
    fechaSuspension, setFechaSuspension,
    horario, setHorario,
    ubicacion, setUbicacion,
    telefono, setTelefono,
    supervisorNombre, setSupervisorNombre,
    supervisorZona, setSupervisorZona
  };
};
