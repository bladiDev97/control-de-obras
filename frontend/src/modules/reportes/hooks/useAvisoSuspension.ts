import { useState } from 'react';

export const useAvisoSuspension = () => {
  const [fecha, setFecha] = useState('21/JULIO/2026');
  const [ubicacion, setUbicacion] = useState('Carretera Morelia a Pátzcuaro');
  const [horario, setHorario] = useState('10:00 a 17:00 horas.');
  const [telefono, setTelefono] = useState('4437969662');

  return {
    fecha, setFecha,
    ubicacion, setUbicacion,
    horario, setHorario,
    telefono, setTelefono
  };
};
