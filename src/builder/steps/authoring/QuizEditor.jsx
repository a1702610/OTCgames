import React from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { useBuilder } from '../../BuilderContext.jsx'
import { MCQEditor } from './MCQEditor.jsx'
import { TrueFalseEditor } from './TrueFalseEditor.jsx'
import { DragDropEditor } from './DragDropEditor.jsx'

export function QuizEditor({ shelfId }) {
  const { state, dispatch, generateId } = useBuilder()
  const [addMenuOpen, setAddMenuOpen] = React.useState(false)

  const shelfQuestions = state.quizQuestions.filter((q) => q.shelfId === shelfId)

  function addQuestion(type) {
    setAddMenuOpen(false)
    const base = { id: generateId(), type, shelfId }
    let question
    if (type === 'mcq') {
      question = { ...base, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    } else if (type === 'truefalse') {
      question = { ...base, statement: '', correctAnswer: true, explanation: '' }
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
          if (q.type === 'dragdrop') return <DragDropEditor {...props} />
          return null
        })}
      </div>

      {shelfQuestions.length === 0 && (
        <p style={{ color: 'rgba(20,15,80,0.4)', fontSize: 13, margin: '0 0 12px' }}>No quiz questions yet for this shelf.</p>
      )}

      {/* Add question dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: '#F8EFE0', border: '1.5px dashed rgba(20,15,80,0.2)',
            color: '#140F50', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Add Question <ChevronDown size={14} />
        </button>
        {addMenuOpen && (
          <div
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 10,
              background: '#FFFFFF', borderRadius: 10, boxShadow: '0 4px 16px rgba(20,15,80,0.15)',
              border: '1px solid rgba(20,15,80,0.1)', minWidth: 180, overflow: 'hidden',
            }}
          >
            {[
              { type: 'mcq', label: 'Multiple Choice', color: '#1448FF' },
              { type: 'truefalse', label: 'True / False', color: '#836BFF' },
              { type: 'dragdrop', label: 'Drag & Drop', color: '#E67E22' },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => addQuestion(opt.type)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', border: 'none', background: 'none',
                  color: opt.color, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20,15,80,0.04)'}
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
