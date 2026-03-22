import { motion, AnimatePresence } from 'framer-motion'

export function ScoreFloat({ delta, id }) {
  return (
    <AnimatePresence>
      {delta !== null && delta !== undefined && (
        <motion.div
          key={id}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -48, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            pointerEvents: 'none',
            fontWeight: 700,
            fontSize: 22,
            color: delta > 0 ? '#27AE60' : '#E74C3C',
            zIndex: 100,
            userSelect: 'none',
          }}
        >
          {delta > 0 ? `+${delta}` : delta}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
