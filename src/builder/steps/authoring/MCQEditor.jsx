import React from 'react'
import { Trash2 } from 'lucide-react'

export function MCQEditor({ question, onUpdate, onDelete }) {
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(131,107,255,0.20)', borderRadius: 12, backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#7da5ff' }}>MCQ Question</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(20,15,80,0.28)' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      <textarea
        value={question.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="Enter the question…"
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.14)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', marginBottom: 14, background: 'rgba(20,15,80,0.05)', color: '#140F50' }}
      />

      {question.options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctIndex === i}
            onChange={() => onUpdate({ correctIndex: i })}
            aria-label={`Mark option ${i + 1} as correct`}
            style={{ flexShrink: 0, width: 18, height: 18, accentColor: '#836BFF' }}
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
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.14)', fontSize: 14, background: 'rgba(20,15,80,0.05)', color: '#140F50' }}
          />
        </div>
      ))}
      <p style={{ margin: '2px 0 14px', fontSize: 12, color: 'rgba(20,15,80,0.35)' }}>Select the radio button next to the correct answer</p>

      <textarea
        value={question.explanation}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        placeholder="Explanation shown after answering…"
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.14)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', background: 'rgba(20,15,80,0.05)', color: '#140F50' }}
      />
    </div>
  )
}
