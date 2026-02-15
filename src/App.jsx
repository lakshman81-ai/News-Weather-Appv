import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import UpAheadPage from './pages/UpAheadPage';
import WeatherPage from './pages/WeatherPage';
import MarketPage from './pages/MarketPage';
import TechSocialPage from './pages/TechSocialPage';
import NewspaperPage from './pages/NewspaperPage';
import SettingsPage from './pages/SettingsPage';
import RefreshPage from './pages/RefreshPage';
import FollowingPage from './pages/FollowingPage';
import TopicDetail from './pages/TopicDetail';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import DebugConsole from './components/DebugConsole';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { NewsProvider, useNews } from './context/NewsContext';
import { MarketProvider } from './context/MarketContext';
import { SettingsProvider } from './context/SettingsContext';
import { SegmentProvider } from './context/SegmentContext';
import { TopicProvider } from './context/TopicContext';
import ProgressBar from './components/ProgressBar';
import './index.css';

const GlobalLoader = () => {
  const { loading: newsLoading } = useNews();
  const { loading: weatherLoading } = useWeather();
  const isLoading = newsLoading || weatherLoading;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999 }}>
      <ProgressBar active={isLoading} color="var(--accent-primary)" style={{ height: '3px' }} />
    </div>
  );
};

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
                <GlobalLoader />
                <DebugConsole />
                <div className="app">
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
