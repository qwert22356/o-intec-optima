import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LLMConsole from './pages/LLMConsole';
import Topology from './pages/Topology';
import ModuleMonitor from './pages/ModuleMonitor';
import ModulePredictive from './pages/ModulePredictive';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="topology" element={<Topology />} />
            <Route path="modules" element={<ModuleMonitor />} />
            <Route path="predictive" element={<ModulePredictive />} />
            <Route path="llm" element={<LLMConsole />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;