import React from 'react'
import { Trash2 } from 'lucide-react'

export function MCQEditor({ question, onUpdate, onDelete }) {
  return (
    <div style={{ padding: 16, background: '#FFFFFF', borderRadius: 12, border: '1.5px solid rgba(20,15,80,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#1448FF' }}>MCQ Question</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Question text */}
      <textarea
        value={question.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="Enter the question…"
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
      />

      {/* 4 options */}
      {question.options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctIndex === i}
            onChange={() => onUpdate({ correctIndex: i })}
            aria-label={`Mark option ${i + 1} as correct`}
            style={{ flexShrink: 0 }}
          />
          <input
            type="text"
            value={opt}
            onChange={(e) => {
              const newOpts = [...question.options]
              newOpts[i] = e.target.value
              onUpdate({ options: newOpts })
            }}
            placeholder={`Option ${i + 1}`}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13 }}
          />
        </div>
      ))}
      <p style={{ margin: '2px 0 12px', fontSize: 11, color: 'rgba(20,15,80,0.5)' }}>Select the radio button next to the correct answer</p>

      {/* Explanation */}
      <textarea
        value={question.explanation}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        placeholder="Explanation shown after answering…"
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
      />
    </div>
  )
}
