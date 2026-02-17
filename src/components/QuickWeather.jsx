import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useSettings } from '../context/SettingsContext';
import WeatherIcon from './WeatherIcons';
import { HumidityIcon, WindIcon } from './AppIcons';

/**
 * Quick Weather Widget — Redesigned (AccuWeather Style)
 * Shows present conditions for all 3 cities at a glance,
 * plus an 8-hour synopsis/forecast for the selected city.
 */
const QuickWeather = () => {
    const { weatherData, loading, error } = useWeather();
    const { settings } = useSettings();
    const [activeCity, setActiveCity] = useState(() => {
        try {
            return localStorage.getItem('weather_active_city') || 'chennai';
        } catch {
            return 'chennai';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('weather_active_city', activeCity);
        } catch {
            // Ignore storage errors
        }
    }, [activeCity]);

    if (loading) return <div className="quick-weather-card qw-bg-day"><div style={{ textAlign: 'center', padding: '20px 0' }}>Loading weather...</div></div>;
    if (error || !weatherData) return <div className="quick-weather-card qw-bg-night"><div style={{ textAlign: 'center', padding: '20px 0' }}>Weather unavailable</div></div>;

    const cities = (settings.weather?.cities || ['chennai', 'trichy', 'muscat']).map(c => c.toLowerCase());

    const cityLabels = {
        chennai: 'Chennai',
        trichy: 'Trichy',
        muscat: 'Muscat',
        [cities[2]]: cities[2].charAt(0).toUpperCase() + cities[2].slice(1)
    };
    const cityIcons = { chennai: '🏛️', trichy: '🏯', muscat: '📍', [cities[2]]: '📍' };

    const hour = new Date().getHours();
    let bgClass = 'qw-bg-day';
    if (hour >= 6 && hour < 11) bgClass = 'qw-bg-morning';
    else if (hour >= 11 && hour < 17) bgClass = 'qw-bg-day';
    else if (hour >= 17 && hour < 20) bgClass = 'qw-bg-evening';
    else bgClass = 'qw-bg-night';

    const activeCityData = weatherData[activeCity];
    const severeWarning = getSevereWarning(activeCityData);

    // Get 8-hour forecast
    const hourlyForecast = activeCityData?.hourly24?.slice(0, 8) || [];
    const timelineSummary = getTimelineSummary(activeCityData, cityLabels[activeCity]);

    return (
        <section className={`quick-weather-card ${bgClass}`}>
            {/* All 3 Cities — Current Conditions */}
            <div className="qw-cities-grid">
                {cities.map(city => {
                    const d = weatherData[city];
                    if (!d?.current) return null;
                    const c = d.current;
                    const isActive = city === activeCity;
                    return (
                        <div
                            key={city}
                            className={`qw-city-card ${isActive ? 'qw-city-card--active' : ''}`}
                            onClick={() => setActiveCity(city)}
                        >
                            <div className="qw-city-header">
                                <span className="qw-city-icon">{cityIcons[city]}</span>
                                <span className="qw-city-name">{cityLabels[city]}</span>
                            </div>
                            <div className="qw-city-temp-row">
                                <span className="qw-city-temp" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.temp}°</span>
                                <span className="qw-city-weather-icon">
                                    {c.iconId ? <WeatherIcon id={c.iconId} size={36} /> : <span style={{fontSize:'2rem'}}>{c.icon}</span>}
                                </span>
                            </div>
                            <div className="qw-city-condition" style={{fontSize: '0.75rem', opacity: 0.9}}>{c.condition}</div>
                            <div className="qw-city-meta">
                                <span>💧 {c.humidity ?? '--'}%</span>
                                <span>💨 {c.windSpeed ?? '--'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 8-Hour Timeline Strip (AccuWeather Style) */}
            {hourlyForecast.length > 0 && (
                <div className="qw-timeline-section">
                    <div className="qw-timeline-header">
                        <span className="qw-timeline-label">{timelineSummary}</span>
                        <span className="qw-timeline-link">Next 8 Hours</span>
                    </div>

                    <div className="qw-timeline-strip-container">
                        {hourlyForecast.map((slot, i) => (
                            <div key={i} className="qw-timeline-slot-modern">
                                <div className="qw-slot-time">{slot.label}</div>
                                <div className="qw-slot-icon-wrapper">
                                    {slot.iconId ? <WeatherIcon id={slot.iconId} size={32} /> : slot.icon}
                                </div>
                                <div className="qw-slot-temp">{slot.temp}°</div>
                                <div className="qw-slot-precip">
                                    {slot.prob > 20 ? (
                                        <span className="qw-precip-badge">
                                            💧 {slot.prob}%
                                        </span>
                                    ) : (
                                        <span className="qw-precip-low">--</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Severe Weather Warning */}
            {severeWarning && (
                <div className="qw-severe-banner">
                    <span className="qw-severe-icon">⚠️</span>
                    <span className="qw-severe-text">{severeWarning}</span>
                </div>
            )}
        </section>
    );
};

function getTimelineSummary(cityData, cityName) {
    if (!cityData?.hourly24) return `${cityName} Forecast`;

    const slots = cityData.hourly24.slice(0, 8);
    const rainSlots = slots.filter(s => s.precip > 0.5 || s.prob > 40);
    const temps = slots.map(s => s.temp).filter(t => t != null);
    const maxTemp = temps.length ? Math.max(...temps) : null;
    const minTemp = temps.length ? Math.min(...temps) : null;

    const current = cityData.current;

    // 1. Rain Logic
    if (rainSlots.length >= 3) {
        return `Rainy spells next 8h`;
    }
    if (rainSlots.length > 0) {
        // Find when
        const firstRain = rainSlots[0];
        return `Rain expected around ${firstRain.label}`;
    }

    // 2. Temperature Trend
    if (current && maxTemp && maxTemp > current.temp + 2) {
        return `Warming up to ${maxTemp}°`;
    }
    if (current && minTemp && minTemp < current.temp - 2) {
        return `Cooling down to ${minTemp}°`;
    }

    // 3. Sky Condition
    if (current?.condition) {
        return `${current.condition}. High ${cityData.forecast?.maxTemp || '--'}°`;
    }

    return `Clear skies ahead`;
}

function getSevereWarning(cityData) {
    if (!cityData?.hourly24) return null;

    const slots = cityData.hourly24;
    const heavyRainSlots = slots.filter(s => s.precip >= 10);
    const stormSlots = slots.filter(s => s.prob >= 80);
    const temps = slots.map(s => s.temp).filter(t => t != null);
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

    if (heavyRainSlots.length > 0) {
        return `Heavy rain warning`;
    }
    if (stormSlots.length >= 2) {
        return 'Thunderstorms likely';
    }
    if (maxTemp != null && maxTemp >= 42) {
        return `Heat warning: ${maxTemp}°C`;
    }
    return null;
}

export default QuickWeather;
