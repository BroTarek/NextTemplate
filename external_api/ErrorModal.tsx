import React, { useState, useEffect } from 'react';
import { globalErrorNotifier } from './errorNotifier';
import { ErrorWithAction } from './utils/getUserFriendlyError';

export const GlobalErrorModal: React.FC = () => {
    const [error, setError] = useState<ErrorWithAction | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const unsubscribe = globalErrorNotifier.subscribe((err) => {
            setError(err);
            setShowDetails(false);
        });
        return unsubscribe;
    }, []);

    if (!error) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{error.title}</h3>
                    {error.status && <span style={styles.badge}>HTTP {error.status}</span>}
                </div>

                <p style={styles.message}>{error.message}</p>

                {error.action && (
                    <div style={styles.actionBox}>
                        <strong>Suggested Action:</strong> {error.action}
                    </div>
                )}

                {error.technicalDetails && (
                    <div style={styles.detailsContainer}>
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            style={styles.detailsToggle}
                        >
                            {showDetails ? 'Hide Details' : 'Show Technical Details'}
                        </button>

                        {showDetails && (
                            <pre style={styles.technicalDetails}>
                                {error.technicalDetails}
                            </pre>
                        )}
                    </div>
                )}

                <div style={styles.footer}>
                    <button
                        type="button"
                        onClick={() => globalErrorNotifier.clearError()}
                        style={styles.closeButton}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#1e1e2e',
        color: '#cdd6f4',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '480px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #313244',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
        color: '#f38ba8',
    },
    badge: {
        backgroundColor: '#f38ba822',
        color: '#f38ba8',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
    message: {
        marginTop: '8px',
        marginBottom: '16px',
        lineHeight: 1.5,
        color: '#a6adc8',
    },
    actionBox: {
        backgroundColor: '#181825',
        borderLeft: '4px solid #89b4fa',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '0.875rem',
        marginBottom: '16px',
    },
    detailsContainer: {
        marginBottom: '16px',
    },
    detailsToggle: {
        background: 'none',
        border: 'none',
        color: '#89b4fa',
        cursor: 'pointer',
        padding: 0,
        fontSize: '0.85rem',
        textDecoration: 'underline',
    },
    technicalDetails: {
        marginTop: '8px',
        backgroundColor: '#11111b',
        color: '#a6e3a1',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        overflowX: 'auto',
        maxHeight: '150px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    closeButton: {
        backgroundColor: '#89b4fa',
        color: '#11111b',
        border: 'none',
        padding: '8px 18px',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};
