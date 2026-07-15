import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AppProfessor from './professor-web/AppProfessor.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProfessor />
  </StrictMode>,
);
