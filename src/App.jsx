import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';

// Lazy Load Pages
const MainPage = lazy(() => import('./pages/MainPage'));
const UpAheadPage = lazy(() => import('./pages/UpAheadPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const MarketPage = lazy(() => import('./pages/MarketPage'));
const TechSocialPage = lazy(() => import('./pages/TechSocialPage'));
const NewspaperPage = lazy(() => import('./pages/NewspaperPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const RefreshPage = lazy(() => import('./pages/RefreshPage'));
const FollowingPage = lazy(() => import('./pages/FollowingPage'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));
import { WeatherProvider } from './context/WeatherContext';
import { NewsProvider } from './context/NewsContext';
import { MarketProvider } from './context/MarketContext';
import { SettingsProvider } from './context/SettingsContext';
import { SegmentProvider } from './context/SegmentContext';
import { TopicProvider } from './context/TopicContext';
import './index.css';

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#888' }}>
    Loading...
  </div>
);

function App() {
  console.log('[App] Rendering root component...');
  return (
    <SettingsProvider>
      <SegmentProvider>
        <WeatherProvider>
          <NewsProvider>
            <MarketProvider>
              <TopicProvider>
                <HashRouter>
                <ScrollToTop />
                <div className="app">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<MainPage />} />
                      <Route path="/up-ahead" element={<UpAheadPage />} />
                      <Route path="/weather" element={<WeatherPage />} />
                      <Route path="/markets" element={<MarketPage />} />
                      <Route path="/tech-social" element={<TechSocialPage />} />
                      <Route path="/newspaper" element={<NewspaperPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/refresh" element={<RefreshPage />} />
                      <Route path="/following" element={<FollowingPage />} />
                      <Route path="/following/:topicId" element={<TopicDetail />} />
                    </Routes>
                  </Suspense>
                  <BottomNav />
                </div>
                </HashRouter>
              </TopicProvider>
            </MarketProvider>
          </NewsProvider>
        </WeatherProvider>
      </SegmentProvider>
    </SettingsProvider>
  );
}

export default App;
