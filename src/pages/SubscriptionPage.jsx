import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../components/Toast';
import { Check, X, Crown, Sparkles, Zap } from 'lucide-react';

export default function SubscriptionPage() {
    const { currentTier, allTiers, changeTier } = useSubscription();
    const { addToast } = useToast();

    const handleChangeTier = (tierId) => {
        changeTier(tierId);
        addToast(`Switched to ${allTiers[tierId].name} plan!`, 'success');
    };

    const tierIcons = { free: <Zap size={32} />, pro: <Crown size={32} />, premium: <Sparkles size={32} /> };
    const tierColors = { free: 'var(--text-secondary)', pro: 'var(--accent-primary)', premium: 'var(--accent-secondary)' };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1 className="page-title">Choose Your Plan</h1>
                <p className="page-subtitle" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    Unlock powerful features to supercharge your productivity. Start free, upgrade anytime.
                </p>
            </div>

            <div className="pricing-grid">
                {Object.values(allTiers).map(tier => {
                    const isCurrent = currentTier === tier.id;
                    const isPopular = tier.id === 'pro';

                    return (
                        <div key={tier.id} className={`pricing-card ${isPopular ? 'popular' : ''}`} style={{ animationDelay: `${Object.keys(allTiers).indexOf(tier.id) * 0.1}s` }}>
                            <div style={{ color: tierColors[tier.id], marginBottom: '12px' }}>
                                {tierIcons[tier.id]}
                            </div>
                            <div className="pricing-tier">{tier.name}</div>
                            <div className="pricing-price">
                                {tier.price === 0 ? 'Free' : (
                                    <>${tier.price}<span>/mo</span></>
                                )}
                            </div>
                            <p className="pricing-desc">
                                {tier.id === 'free' ? 'Get started with the basics' :
                                    tier.id === 'pro' ? 'For power users who need more' :
                                        'The ultimate productivity suite'}
                            </p>
                            <ul className="pricing-features">
                                {tier.features.map((f, i) => (
                                    <li key={i}><Check size={18} /> {f}</li>
                                ))}
                                {tier.locked.map((f, i) => (
                                    <li key={`l${i}`} className="disabled"><X size={18} /> {f}</li>
                                ))}
                            </ul>
                            <button
                                className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                                style={{ width: '100%' }}
                                onClick={() => handleChangeTier(tier.id)}
                                disabled={isCurrent}
                            >
                                {isCurrent ? '✓ Current Plan' : tier.price === 0 ? 'Downgrade' : 'Upgrade Now'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                <p>💡 Plans are simulated for demo purposes. No real charges will be made.</p>
                <p style={{ marginTop: '4px' }}>All features are instantly available upon switching tiers.</p>
            </div>
        </div>
    );
}
