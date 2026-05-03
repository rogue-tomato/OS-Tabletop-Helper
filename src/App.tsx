import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CharacterPage } from './pages/CharacterPage';

export default function App() {
  return (
    <>
      {/* Full-viewport fixed backdrop. See `.app-bg` in index.css. */}
      <div className="app-bg" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character/:slug" element={<CharacterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
