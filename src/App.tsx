import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import { PreparationProvider } from '@/context/PreparationContext';
import About from '@/pages/About';
import Benchmark from '@/pages/Benchmark';
import Briefing from '@/pages/Briefing';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import Prepare from '@/pages/Prepare';

export default function App() {
  return (
    <PreparationProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prepare" element={<Prepare />} />
          <Route path="briefing" element={<Briefing />} />
          <Route path="benchmark" element={<Benchmark />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </PreparationProvider>
  );
}
