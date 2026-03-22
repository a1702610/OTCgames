import { motion, LayoutGroup } from 'framer-motion'

export function PillTabSwitcher({ tabs, activeTab, onTabChange }) {
  // tabs: [{ id, label }]
  return (
    <LayoutGroup>
      <div
        style={{
          display: 'flex',
          gap: 4,
          backgroundColor: 'rgba(20,15,80,0.12)',
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
              color: activeTab === tab.id ? '#140F50' : 'rgba(20,15,80,0.6)',
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
                  backgroundColor: '#FFFFFF',
                  borderRadius: 36,
                  zIndex: -1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
