import React from 'react'
import { Trash2 } from 'lucide-react'

export function TrueFalseEditor({ question, onUpdate, onDelete }) {
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#a89eff' }}>True / False</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.30)' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      <textarea
        value={question.statement}
        onChange={(e) => onUpdate({ statement: e.target.value })}
        placeholder="Enter the statement…"
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.09)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', marginBottom: 14, background: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.90)' }}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => onUpdate({ correctAnswer: val })}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 10,
              border: `1.5px solid ${question.correctAnswer === val ? '#27AE60' : 'rgba(255,255,255,0.09)'}`,
              background: question.correctAnswer === val ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.045)',
              color: question.correctAnswer === val ? '#5dda8a' : 'rgba(255,255,255,0.50)',
              fontWeight: 700, fontSize: 16, cursor: 'pointer',
            }}
          >
            {val ? 'True' : 'False'}
          </button>
        ))}
      </div>

      <textarea
        value={question.explanation}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        placeholder="Explanation…"
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.09)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', background: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.90)' }}
      />
    </div>
  )
}
