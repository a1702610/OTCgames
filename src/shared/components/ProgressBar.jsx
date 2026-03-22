import { motion } from 'framer-motion'

export function ProgressBar({ current, total, color = '#1448FF', height = 6 }) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: height,
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <motion.div
        style={{ height: '100%', backgroundColor: color, borderRadius: height }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  )
}
