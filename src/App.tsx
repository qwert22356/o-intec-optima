import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Topology from './pages/Topology';
import ModuleMonitor from './pages/ModuleMonitor';
import LLMConsole from './pages/LLMConsole';
import ModulePredictive from './pages/ModulePredictive';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topology" element={<Topology />} />
          <Route path="/modules" element={<ModuleMonitor />} />
          <Route path="/predictive" element={<ModulePredictive />} />
          <Route path="/llm" element={<LLMConsole />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/billing" element={<Billing />} />
        </Route>
      </Routes>
    </Router>
  );
}