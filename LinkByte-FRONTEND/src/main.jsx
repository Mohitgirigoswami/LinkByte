import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Auth from './components/Auth/Auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Error404 from './components/Error404/Error404';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/*" element={<Error404 />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>
);
