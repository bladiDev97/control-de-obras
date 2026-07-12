import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ObrasPage from '../modules/obras/pages/ObrasPage';
import BitacorasPage from '../modules/bitacoras/pages/BitacorasPage';
import CapitalizacionPage from '../modules/capitalizacion/pages/CapitalizacionPage';
import ExcelImportPage from '../modules/excelImport/pages/ExcelImportPage';
import ReportesPage from '../modules/reportes/pages/ReportesPage';
import ContratosPage from '../modules/contratos/pages/ContratosPage';
import ContratoDetailPage from '../modules/contratos/pages/ContratoDetailPage';
import PersonalPage from '../modules/personal/pages/PersonalPage';
import { ConfiguracionPage } from '../modules/configuracion/pages/ConfiguracionPage';
import MapaPage from '../modules/mapa/pages/MapaPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/obras" replace />} />
        <Route path="obras" element={<ObrasPage />} />
        <Route path="bitacoras" element={<BitacorasPage />} />
        <Route path="capitalizacion" element={<CapitalizacionPage />} />
        <Route path="contratos" element={<ContratosPage />} />
        <Route path="contratos/:numeroContrato" element={<ContratoDetailPage />} />
        <Route path="personal" element={<PersonalPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="excel" element={<ExcelImportPage />} />
      </Route>
      {/* Standalone map window — same-origin so window reuse works perfectly */}
      <Route path="mapa" element={<MapaPage />} />
    </Routes>
  );
}

