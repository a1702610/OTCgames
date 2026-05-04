import React from 'react'
import { Trash2 } from 'lucide-react'

function countBlankMarkers(sentence) {
  return (sentence.split('_').length - 1)
}

function BlankAnswerInput({ initialAnswers, onCommit, label }) {
  const [text, setText] = React.useState(() => (initialAnswers || []).join(', '))
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 5 }}>
        {label} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>(comma-separated, case-insensitive)</span>
      </label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onCommit(text.split(',').map((a) => a.trim()).filter(Boolean))}
        placeholder="e.g. NSAID, non-steroidal anti-inflammatory"
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.09)', fontSize: 14, boxSizing: 'border-box', background: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.90)' }}
      />
    </div>
  )
}

export function FillInBlanksEditor({ question, onUpdate, onDelete }) {
  const blankCount = (question.sentence || '').split('_').length - 1
  const blanks = question.blanks || []

  function handleSentenceChange(sentence) {
    const newCount = sentence.split('_').length - 1
    const newBlanks = Array.from({ length: newCount }, (_, i) => blanks[i] || { answers: [] })
    onUpdate({ sentence, blanks: newBlanks })
  }

  function updateBlankAnswers(blankIndex, answers) {
    const newBlanks = blanks.map((b, i) => (i === blankIndex ? { answers } : b))
    onUpdate({ blanks: newBlanks })
  }

  return (
    <div style={{ padding: 18, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#5dda8a' }}>Fill in the Blanks</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.30)' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6 }}>
        Sentence <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>(use _ for each blank)</span>
      </label>
      <textarea
        value={question.sentence || ''}
        onChange={(e) => handleSentenceChange(e.target.value)}
        placeholder="e.g. Aspirin belongs to the _ drug class and is used for _."
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.09)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', marginBottom: 4, background: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.90)' }}
      />
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        {blankCount === 0 ? 'No blanks detected — add _ to create blanks.' : `${blankCount} blank${blankCount > 1 ? 's' : ''} detected`}
      </p>

      {blanks.map((blank, i) => (
        <BlankAnswerInput
          key={i}
          initialAnswers={blank.answers}
          label={`Blank ${i + 1} — accepted answers`}
          onCommit={(answers) => updateBlankAnswers(i, answers)}
        />
      ))}

      <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', display: 'block', marginBottom: 6, marginTop: blankCount > 0 ? 4 : 0 }}>Explanation</label>
      <textarea
        value={question.explanation || ''}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        placeholder="Explanation shown after answering… (optional)"
        rows={3}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.09)', fontSize: 15, resize: 'vertical', boxSizing: 'border-box', background: 'rgba(255,255,255,0.055)', color: 'rgba(255,255,255,0.90)' }}
      />
    </div>
  )
}
