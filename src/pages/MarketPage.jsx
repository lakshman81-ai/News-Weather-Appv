import React, { useEffect, useState } from 'react';
import MarketStickyHeader from '../components/MarketStickyHeader';
import MutualFundCard from '../components/MutualFundCard';
import IPOCard from '../components/IPOCard';
import SectionNavigator from '../components/SectionNavigator';
import { useMarket } from '../context/MarketContext';
import { useSettings } from '../context/SettingsContext';

/**
 * Enhanced Market Dashboard
 * Focused on Indian Stock Market:
 * - NSE/BSE Indices
 * - Top Gainers/Losers
 * - Mutual Fund NAVs
 * - IPO Tracker
 * - Market Trends
 */
function MarketPage() {
    const { marketData, loading, error, refreshMarket, lastFetch } = useMarket();
    const { settings } = useSettings();
    const marketSettings = settings?.market || {};
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        // Update current time every minute to refresh stale status
        const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        refreshMarket();
    };

    const getAge = (item) => {
        const ts = item?.timestamp || lastFetch;
        if (!ts) return Infinity;
        return currentTime - ts;
    };

    const getStaleStyle = (item) => {
        const age = getAge(item);
        const isStale = age > 15 * 60 * 1000; // > 15 mins
        const isExpired = age > 4 * 60 * 60 * 1000; // > 4 hours

        if (isExpired) {
            return {
                opacity: 0.3,
                filter: 'grayscale(1) brightness(0.7)',
                transition: 'all 0.3s ease'
            };
        }
        if (isStale) {
            return {
                opacity: 0.6,
                filter: 'grayscale(0.5)',
                transition: 'all 0.3s ease'
            };
        }
        return { opacity: 1, filter: 'none', transition: 'all 0.3s ease' };
    };

    // Back to Top Logic
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation Sections (for mobile quick nav)
    const navSections = [
        (marketSettings.showGainers !== false || marketSettings.showLosers !== false) && { id: 'market-movers', icon: '📈', label: 'Top Movers' },
        marketSettings.showSectorals !== false && { id: 'sectoral-indices', icon: '🏛️', label: 'Sectorals' },
        marketSettings.showCommodities !== false && { id: 'commodities', icon: '🪙', label: 'Commodities' },
        marketSettings.showCurrency !== false && { id: 'currency', icon: '💱', label: 'Currency' },
        marketSettings.showFIIDII !== false && { id: 'fiidii', icon: '🏦', label: 'FII/DII' },
        marketSettings.showMutualFunds !== false && { id: 'mutual-funds', icon: '💰', label: 'Mutual Funds' },
        marketSettings.showIPO !== false && { id: 'ipo-tracker', icon: '🎯', label: 'IPO Watch' }
    ].filter(Boolean);

    if (loading && !marketData) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div className="loading">
                    <div className="loading__spinner"></div>
                    <span>Loading Market Data...</span>
                </div>
            </div>
        );
    }

    const { indices, mutualFunds, ipo, movers, sectorals, commodities, currencies, fiidii } = marketData || {};

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="page-container" style={{ padding: 0 }}>
            {/* Sticky Header replaces standard Header & Indices Section */}
            <MarketStickyHeader
                indices={indices}
                onRefresh={handleRefresh}
                loading={loading}
                lastUpdated={lastFetch}
            />

            <main className="main-content market-page" style={{ padding: '16px', marginTop: 0 }}>
                {error && (
                    <div className="error-state" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid var(--accent-danger)', borderRadius: '8px', color: 'var(--accent-danger)' }}>
                        <p style={{ margin: 0 }}>Failed to load market data. Showing cached data.</p>
                    </div>
                )}

                <div className="dashboard-grid">

                    {/* =========== TOP MOVERS (Gainers & Losers) =========== */}
                    {(marketSettings.showGainers !== false || marketSettings.showLosers !== false) && (
                        <div id="market-movers" className="modern-card dashboard-col-2">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>📈</span> Top Movers
                                </h2>
                            </div>

                            <div className="movers-grid">
                                {/* Gainers */}
                                {marketSettings.showGainers !== false && (
                                    <div className="movers-column movers-column--gainers">
                                        <h3 className="movers-column__title">🔼 Top Gainers</h3>
                                        {movers?.gainers?.slice(0, 5).map((stock, idx) => (
                                            <div key={idx} className="mover-item" style={getStaleStyle(stock)}>
                                                <div className="mover-item__symbol">{stock.symbol}</div>
                                                <div className="mover-item__price">₹{stock.price}</div>
                                                <div className="mover-item__change text-success">
                                                    +{stock.changePercent}%
                                                </div>
                                            </div>
                                        ))}
                                        {(!movers?.gainers || movers.gainers.length === 0) && <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>No gainers data</div>}
                                    </div>
                                )}

                                {/* Losers */}
                                {marketSettings.showLosers !== false && (
                                    <div className="movers-column movers-column--losers">
                                        <h3 className="movers-column__title">🔽 Top Losers</h3>
                                        {movers?.losers?.slice(0, 5).map((stock, idx) => (
                                            <div key={idx} className="mover-item" style={getStaleStyle(stock)}>
                                                <div className="mover-item__symbol">{stock.symbol}</div>
                                                <div className="mover-item__price">₹{stock.price}</div>
                                                <div className="mover-item__change text-danger">
                                                    {stock.changePercent}%
                                                </div>
                                            </div>
                                        ))}
                                         {(!movers?.losers || movers.losers.length === 0) && <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>No losers data</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =========== SECTORAL INDICES =========== */}
                    {marketSettings.showSectorals !== false && (
                        <div id="sectoral-indices" className="modern-card">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>🏛️</span> Sectoral Indices
                                </h2>
                            </div>
                            <div className="sectoral-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                                {sectorals?.map((sector, idx) => (
                                    <div
                                        key={idx}
                                        className="sectoral-card"
                                        style={getStaleStyle(sector)}
                                    >
                                        <div className="sectoral-card__name">{sector.name}</div>
                                        <div className="sectoral-card__value">{sector.value}</div>
                                        <div className={`sectoral-card__change ${sector.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {sector.changePercent >= 0 ? '▲' : '▼'} {Math.abs(sector.changePercent)}%
                                        </div>
                                    </div>
                                ))}
                                {(!sectorals || sectorals.length === 0) && <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>No sectoral data</div>}
                            </div>
                        </div>
                    )}

                    {/* =========== COMMODITIES =========== */}
                    {marketSettings.showCommodities !== false && (
                        <div id="commodities" className="modern-card">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>🪙</span> Commodity Watch
                                </h2>
                            </div>
                            <div className="commodity-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {commodities?.map((commodity, idx) => (
                                    <div
                                        key={idx}
                                        className="commodity-card"
                                        style={{ ...getStaleStyle(commodity), display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', minHeight: 'auto' }}
                                    >
                                        <div>
                                            <div className="commodity-card__name" style={{ marginBottom: 0 }}>{commodity.name}</div>
                                            <div className="commodity-card__unit" style={{ fontSize: '0.65rem' }}>{commodity.unit}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="commodity-card__value" style={{ fontSize: '1rem' }}>{commodity.value}</div>
                                            <div className={`commodity-card__change ${commodity.changePercent >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!commodities || commodities.length === 0) && <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>No commodity data</div>}
                            </div>
                        </div>
                    )}

                    {/* =========== CURRENCY RATES =========== */}
                    {marketSettings.showCurrency !== false && (
                        <div id="currency" className="modern-card">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>💱</span> Currency Rates
                                </h2>
                            </div>
                            <div className="currency-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {currencies?.map((currency, idx) => (
                                    <div
                                        key={idx}
                                        className="currency-card"
                                        style={{ ...getStaleStyle(currency), display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', minHeight: 'auto' }}
                                    >
                                        <div className="currency-card__name" style={{ marginBottom: 0 }}>{currency.name}</div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="currency-card__value" style={{ fontSize: '1rem' }}>₹{currency.value}</div>
                                            <div className={`currency-card__change ${currency.changePercent >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.75rem' }}>
                                                {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!currencies || currencies.length === 0) && <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'center', padding: '10px'}}>No currency data</div>}
                            </div>
                        </div>
                    )}

                    {/* =========== FII/DII ACTIVITY =========== */}
                    {marketSettings.showFIIDII !== false && (
                        <div id="fiidii" className="modern-card">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>🏦</span> FII/DII Activity
                                </h2>
                            </div>
                            <div className="fiidii-container" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="fiidii-block">
                                    <h3 className="fiidii-block__title">FII (Foreign)</h3>
                                    <div className="fiidii-stats">
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Buy:</span>
                                            <span className="fiidii-stat__value text-success">₹{fiidii?.fii?.buy || '--'} Cr</span>
                                        </div>
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Sell:</span>
                                            <span className="fiidii-stat__value text-danger">₹{fiidii?.fii?.sell || '--'} Cr</span>
                                        </div>
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Net:</span>
                                            <span className={`fiidii-stat__value ${fiidii?.fii?.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                                ₹{fiidii?.fii?.net || '--'} Cr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="fiidii-block">
                                    <h3 className="fiidii-block__title">DII (Domestic)</h3>
                                    <div className="fiidii-stats">
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Buy:</span>
                                            <span className="fiidii-stat__value text-success">₹{fiidii?.dii?.buy || '--'} Cr</span>
                                        </div>
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Sell:</span>
                                            <span className="fiidii-stat__value text-danger">₹{fiidii?.dii?.sell || '--'} Cr</span>
                                        </div>
                                        <div className="fiidii-stat">
                                            <span className="fiidii-stat__label">Net:</span>
                                            <span className={`fiidii-stat__value ${fiidii?.dii?.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                                ₹{fiidii?.dii?.net || '--'} Cr
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="fiidii-date" style={{ textAlign: 'center' }}>As of: {fiidii?.date || 'N/A'}</div>
                            </div>
                        </div>
                    )}

                    {/* =========== MUTUAL FUNDS =========== */}
                    {marketSettings.showMutualFunds !== false && (
                        <div id="mutual-funds" className="modern-card dashboard-col-2">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>📊</span> Mutual Fund NAVs
                                </h2>
                            </div>
                            <MutualFundCard funds={mutualFunds} />
                        </div>
                    )}

                    {/* =========== IPO TRACKER =========== */}
                    {marketSettings.showIPO !== false && (
                        <div id="ipo-tracker" className="modern-card dashboard-col-2">
                            <div className="modern-card__header">
                                <h2 className="modern-card__title">
                                    <span>🎯</span> IPO Tracker
                                </h2>
                            </div>
                            <IPOCard ipoData={ipo} />
                        </div>
                    )}
                </div>

                {/* =========== DISCLAIMER =========== */}
                <div className="market-disclaimer">
                    <div>* Data is for informational purposes only. Not investment advice.</div>
                    {marketData?.fetchedAt && (
                        <div style={{fontSize:'0.7rem', opacity:0.7, marginTop:'4px'}}>
                            Last Updated: {new Date(marketData.fetchedAt).toLocaleString()}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Section Navigator */}
            <SectionNavigator sections={navSections} />

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    opacity: showBackToTop ? 1 : 0,
                    pointerEvents: showBackToTop ? 'auto' : 'none',
                    transition: 'all 0.3s ease',
                    zIndex: 900,
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
            >
                ↑
            </button>
        </div>
    );
}

export default MarketPage;
