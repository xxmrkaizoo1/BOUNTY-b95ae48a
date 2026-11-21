import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import { AppStateProvider } from "./state/AppState";
import Layout, { PageSpinner } from "./components/Layout";
import FeedPage from "./pages/FeedPages";

// Less-visited pages load on demand to keep the first load small.
const NewReportPage = lazy(() => import("./pages/NewReportPage"));
const ReportDetailPage = lazy(() => import("./pages/ReportDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <Layout>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/new" element={<NewReportPage />} />
              <Route path="/report/:id" element={<ReportDetailPage />} />
              <Route path="/report/:id/edit" element={<NewReportPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </AppStateProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
