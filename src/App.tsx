import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import Football from './pages/Football';
import Rugby from './pages/Rugby';
import Tours from './pages/Tours';
import Corporate from './pages/Corporate';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import Info from './pages/Info';
import TourDetail from './pages/TourDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/football" element={<Football />} />
      <Route path="/rugby" element={<Rugby />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tour/:id" element={<TourDetail />} />
      <Route path="/corporate" element={<Corporate />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/event" element={<EventDetail />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/info/:topic" element={<Info />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
