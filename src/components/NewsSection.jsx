import React, { useState } from 'react';
import { addReadArticle, getSettings } from '../utils/storage';
import { useNews } from '../context/NewsContext';
import ProgressBar from './ProgressBar';

/**
 * News Section Component
 * Displays news items for a specific region (World/India/Chennai/Trichy/Local/Entertainment)
 * Features:
 * - Clickable headlines open story URL
 * - Critics/public view shown where applicable
 * - Source count displayed
 * - Collapsible header
 */
function NewsSection({
    id,
    title,
    icon,
    colorClass,
    news = [],
    maxDisplay = 3,
    showExpand = true,
    error = null,
    extraContent = null,
    onArticleClick = null,
    showCritics = true,
    loading = false
}) {
    const [expanded, setExpanded] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { auditResults } = useNews();

    // Get trending threshold from settings (default 12)
    const settings = getSettings();
    const trendingThreshold = settings.rankingWeights?.trending?.threshold || 12;

    const displayCount = expanded ? news.length : Math.min(maxDisplay, news.length);
    const displayNews = news.slice(0, displayCount);
    const hasMore = news.length > maxDisplay;

    // --- Section Health Badges ---
    const health = news.health || { status: 'ok' };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return '';
        // eslint-disable-next-line react-hooks/purity
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return "Now";
    };

    const handleStoryClick = (item) => {
        // Track history
        addReadArticle(item);

        // External handler
        if (onArticleClick) {
            onArticleClick(item);
        }

        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="empty-state" style={{ borderColor: 'rgba(255, 87, 87, 0.3)' }}>
                    <div className="empty-state__icon">❌</div>
                    <p style={{ color: '#ff5757' }}>{error}</p>
                </div>
            );
        }

        if (loading) {
            return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading stories...</div>;
        }

        if (news.length === 0) {
            return (
                <div className="empty-state">
                    <div className="empty-state__icon">📭</div>
                    <p>No news available for this section</p>
                </div>
            );
        }

        return (
            <>
                {extraContent}
                <div className="news-list-modern">
                    {displayNews.map((item, idx) => (
                        <article
                            key={item.id || idx}
                            className="modern-news-card"
                            onClick={() => handleStoryClick(item)}
                            style={{ cursor: item.url ? 'pointer' : 'default' }}
                        >
                            <div className="mnc-header">
                                <span className="mnc-source">{item.source}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="mnc-time">{getTimeAgo(item.publishedAt) || item.time}</span>
                                    {title === 'Top Stories' && item._scoreBreakdown && (
                                        <span
                                            className="info-icon"
                                            title="View Ranking Score Breakdown"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const b = item._scoreBreakdown;
                                                const details = `Ranking Score: ${item.impactScore.toFixed(2)}\n\n` +
                                                `Freshness: ${b.freshness?.toFixed(2)}\n` +
                                                `Source Tier: ${b.sourceScore?.toFixed(2)}\n` +
                                                `Relevance Multiplier: ${b.impact?.toFixed(2) || 1.0}\n` +
                                                `Live Boost: ${b.liveBoost || 1.0}\n` +
                                                `Breaking Boost: ${b.breakingBoost || 1.0}`;
                                                alert(details);
                                            }}
                                            style={{ cursor: 'help', fontSize: '1rem', opacity: 0.7 }}
                                        >
                                            ⓘ
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="mnc-headline">
                                {item.headline}
                            </h3>

                            {item.summary && (
                                <p className="mnc-summary">
                                    {item.summary}
                                </p>
                            )}

                            {/* Badges Row */}
                            <div className="mnc-badges">
                                {item.isBreaking && <span className="mnc-badge mnc-badge--breaking">⚡ Breaking</span>}
                                {(!item.isBreaking && item.impactScore > trendingThreshold) && <span className="mnc-badge mnc-badge--trending">🔥 Trending</span>}

                                {item.sourceCount > 1 && (
                                    <span className="mnc-badge mnc-badge--consensus">
                                        🔔 {item.sourceCount} sources
                                    </span>
                                )}

                                {item.sentiment && (
                                    <span className={`mnc-badge mnc-badge--sentiment-${item.sentiment.label}`}>
                                        {item.sentiment.label === 'positive' ? 'Positive' :
                                            item.sentiment.label === 'negative' ? 'Negative' : 'Neutral'}
                                    </span>
                                )}
                            </div>

                            {showCritics && item.criticsView && (
                                <div className="mnc-critics">
                                    <strong>Critics Take:</strong> {item.criticsView}
                                </div>
                            )}

                            {auditResults[item.id] && (
                                <div className="mnc-audit-row">
                                    {auditResults[item.id].consensus?.badge && <span>{auditResults[item.id].consensus.badge}</span>}
                                    {auditResults[item.id].breakingVerified && <span>{auditResults[item.id].breakingVerified}</span>}
                                </div>
                            )}
                        </article>
                    ))}
                </div>

                {showExpand && hasMore && (
                    <div
                        className="news-more-modern"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span>{expanded ? 'Collapse' : `Show ${news.length - maxDisplay} more`}</span>
                        <span style={{ fontSize: '1.2rem' }}>{expanded ? '▲' : '▼'}</span>
                    </div>
                )}
            </>
        );
    };

    return (
        <section className="news-section" id={id}>
            <h2
                className={`news-section__title ${colorClass}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{ cursor: 'pointer' }}
                title={`Tap to fold/unfold. Health: ${health.status.toUpperCase()}`}
            >
                <div className="news-title-left">
                    <span className="news-icon">{icon}</span>
                    <span className="news-text">{title}</span>
                    {title === 'Top Stories' && (
                        <span
                            className="info-icon"
                            title="Ranked by relevance, breaking status, and sentiment analysis."
                            onClick={(e) => { e.stopPropagation(); alert('Top Stories Ranking Logic:\n\n1. Breaking news prioritised.\n2. Consensus (multiple sources) boosted.\n3. Sentiment-based weight applied.\n4. Recent articles scored higher.'); }}
                            style={{ cursor: 'help', fontSize: '0.8em', marginLeft: '5px', opacity: 0.7 }}
                        >
                            ⓘ
                        </span>
                    )}
                </div>

                <div className="news-title-right">
                    {/* Health Indicators */}
                    {health.status === 'critical' && <span title="Critical Feed" className="indicator-dot red"></span>}
                    {health.status === 'warning' && <span title="Warning Feed" className="indicator-dot orange"></span>}

                    {news.length > 0 && (
                        <span className="news-count">({news.length})</span>
                    )}

                    {/* Collapse Indicator */}
                    <span className="collapse-arrow">
                        {isCollapsed ? '▼' : '▲'}
                    </span>
                </div>
            </h2>

            <ProgressBar active={loading} />

            {!isCollapsed && renderContent()}
        </section>
    );
}

export default NewsSection;
