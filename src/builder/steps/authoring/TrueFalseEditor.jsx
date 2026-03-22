import React from 'react'
import { Trash2 } from 'lucide-react'

export function TrueFalseEditor({ question, onUpdate, onDelete }) {
  return (
    <div style={{ padding: 16, background: '#FFFFFF', borderRadius: 12, border: '1.5px solid rgba(20,15,80,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#836BFF' }}>True / False</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      <textarea
        value={question.statement}
        onChange={(e) => onUpdate({ statement: e.target.value })}
        placeholder="Enter the statement…"
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => onUpdate({ correctAnswer: val })}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 8,
              border: `2px solid ${question.correctAnswer === val ? '#27AE60' : 'rgba(20,15,80,0.12)'}`,
              background: question.correctAnswer === val ? 'rgba(39,174,96,0.1)' : '#FFFFFF',
              color: question.correctAnswer === val ? '#27AE60' : 'rgba(20,15,80,0.5)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
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
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
      />
    </div>
  )
}
