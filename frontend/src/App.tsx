import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/home';
import { LandingPage } from './pages/landing-page'; // 👈 importa la nueva portada
import { LoginForm } from './pages/login-form';
import { Register } from './pages/register-user';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
