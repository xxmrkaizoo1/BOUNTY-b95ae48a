import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import { AppStateProvider } from "./state/AppState";
import Layout from "./components/Layout";
import FeedPage from "./pages/FeedPages";
import NewReportPage from "./pages/NewReportPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import ProfilePage from "./pages/ProfilePage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/new" element={<NewReportPage />} />
            <Route path="/report/:id" element={<ReportDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </AppStateProvider>
    </BrowserRouter>
  </React.StrictMode>
);


// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css';
// import App from './App.tsx'

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
