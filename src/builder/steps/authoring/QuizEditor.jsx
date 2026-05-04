import React from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useBuilder } from '../../BuilderContext.jsx'
import { MCQEditor } from './MCQEditor.jsx'
import { TrueFalseEditor } from './TrueFalseEditor.jsx'
import { FillInBlanksEditor } from './FillInBlanksEditor.jsx'

export function QuizEditor({ shelfId }) {
  const { state, dispatch, generateId } = useBuilder()
  const [addMenuOpen, setAddMenuOpen] = React.useState(false)

  const shelfQuestions = state.quizQuestions.filter((q) => q.shelfId === shelfId && q.type !== 'dragdrop')

  function addQuestion(type) {
    setAddMenuOpen(false)
    const base = { id: generateId(), type, shelfId }
    let question
    if (type === 'mcq') {
      question = { ...base, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    } else if (type === 'truefalse') {
      question = { ...base, statement: '', correctAnswer: true, explanation: '' }
    } else if (type === 'fillinblanks') {
      question = { ...base, sentence: '', blanks: [], explanation: '' }
    } else {
      question = { ...base, instruction: '', categories: [], productAssignments: [], explanation: '' }
    }
    dispatch({ type: 'ADD_QUIZ_QUESTION', question })
  }

  function updateQuestion(id, updates) {
    dispatch({ type: 'UPDATE_QUIZ_QUESTION', id, updates })
  }

  function deleteQuestion(id) {
    if (window.confirm('Delete this question?')) {
      dispatch({ type: 'DELETE_QUIZ_QUESTION', id })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {shelfQuestions.map((q) => {
          const props = {
            key: q.id,
            question: q,
            onUpdate: (updates) => updateQuestion(q.id, updates),
            onDelete: () => deleteQuestion(q.id),
          }
          if (q.type === 'mcq') return <MCQEditor {...props} />
          if (q.type === 'truefalse') return <TrueFalseEditor {...props} />
          if (q.type === 'fillinblanks') return <FillInBlanksEditor {...props} />
          return null
        })}
      </div>

      {shelfQuestions.length === 0 && (
        <p style={{ color: 'rgba(20,15,80,0.35)', fontSize: 13, margin: '0 0 12px' }}>No quiz questions yet for this shelf.</p>
      )}

      {/* Add question dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(255,255,255,0.78)', border: '1.5px dashed rgba(255,255,255,0.15)',
            color: 'rgba(20,15,80,0.65)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Add Question <ChevronDown size={14} />
        </button>
        {addMenuOpen && (
          <div
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 10,
              background: 'rgba(255,255,255,0.98)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
              minWidth: 180, overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {[
              { type: 'mcq', label: 'Multiple Choice', color: '#7da5ff' },
              { type: 'truefalse', label: 'True / False', color: '#836BFF' },
              { type: 'fillinblanks', label: 'Fill in the Blanks', color: '#5dda8a' },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => addQuestion(opt.type)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', border: 'none', background: 'none',
                  color: opt.color, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20,15,80,0.07)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
