import { motion, LayoutGroup } from 'framer-motion'

export function PillTabSwitcher({ tabs, activeTab, onTabChange }) {
  return (
    <LayoutGroup>
      <div
        style={{
          display: 'flex',
          gap: 4,
          backgroundColor: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 40,
          padding: 4,
          width: 'fit-content',
          margin: '0 auto',
        }}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              padding: '8px 20px',
              borderRadius: 36,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              background: 'transparent',
              color: activeTab === tab.id ? '#a89eff' : 'rgba(255,255,255,0.42)',
              zIndex: 1,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pill-active"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(131,107,255,0.22)',
                  border: '1px solid rgba(131,107,255,0.30)',
                  borderRadius: 36,
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </LayoutGroup>
  )
}
