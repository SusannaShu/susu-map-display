/**
 * AuthModal -- display version stub.
 * No real authentication needed. This component is retained
 * only as a placeholder in case any code references it.
 */

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '12px' }}>Display Mode</h2>
        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
          Authentication is disabled in the display version. All features are available with a demo account.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--color-primary, #0d9488)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
