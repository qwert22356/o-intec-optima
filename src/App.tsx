import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ModuleMonitor from './pages/ModuleMonitor';
import ModulePredictive from './pages/ModulePredictive';
import Analytics from './pages/Analytics';
import Configuration from './pages/Configuration';
import LLMConsole from './pages/LLMConsole';
import DeviceConnections from './pages/DeviceConnections';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="module-monitor" element={<ModuleMonitor />} />
          <Route path="module-predictive" element={<ModulePredictive />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="llm-console" element={<LLMConsole />} />
          <Route path="device-connections" element={<DeviceConnections />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;