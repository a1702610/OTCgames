import React from 'react'
import { Trash2, Plus } from 'lucide-react'
import { getProductsByShelf } from '../../../data/products.js'

const PRESET_COLORS = ['#E74C3C', '#9B59B6', '#2980B9', '#27AE60', '#E67E22', '#1ABC9C']

export function DragDropEditor({ question, onUpdate, onDelete }) {
  const shelfProducts = getProductsByShelf(question.shelfId)

  function addCategory() {
    const newCat = {
      id: `cat-${Date.now()}`,
      label: '',
      color: PRESET_COLORS[question.categories.length % PRESET_COLORS.length],
    }
    onUpdate({ categories: [...question.categories, newCat] })
  }

  function updateCategory(catId, updates) {
    onUpdate({
      categories: question.categories.map((c) => c.id === catId ? { ...c, ...updates } : c),
    })
  }

  function removeCategory(catId) {
    // Also reset products assigned to this category to null (distractor)
    onUpdate({
      categories: question.categories.filter((c) => c.id !== catId),
      productAssignments: question.productAssignments.map((a) =>
        a.categoryId === catId ? { ...a, categoryId: null } : a
      ),
    })
  }

  function toggleProduct(productId) {
    const exists = question.productAssignments.find((a) => a.productId === productId)
    if (exists) {
      onUpdate({ productAssignments: question.productAssignments.filter((a) => a.productId !== productId) })
    } else {
      onUpdate({ productAssignments: [...question.productAssignments, { productId, categoryId: null }] })
    }
  }

  function assignProduct(productId, categoryId) {
    onUpdate({
      productAssignments: question.productAssignments.map((a) =>
        a.productId === productId ? { ...a, categoryId: categoryId === 'null' ? null : categoryId } : a
      ),
    })
  }

  return (
    <div style={{ padding: 16, background: '#FFFFFF', borderRadius: 12, border: '1.5px solid rgba(20,15,80,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#E67E22' }}>Drag & Drop</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }} aria-label="Delete question">
          <Trash2 size={16} />
        </button>
      </div>

      <textarea
        value={question.instruction}
        onChange={(e) => onUpdate({ instruction: e.target.value })}
        placeholder="Instruction (e.g. Drag each product to the correct category)"
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
      />

      {/* Categories */}
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '0 0 8px' }}>Categories (2–4)</p>
      {question.categories.map((cat) => (
        <div key={cat.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={cat.color}
            onChange={(e) => updateCategory(cat.id, { color: e.target.value })}
            style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }}
            aria-label="Category colour"
          />
          <input
            type="text"
            value={cat.label}
            onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
            placeholder="Category name"
            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1.5px solid rgba(20,15,80,0.12)', fontSize: 13 }}
          />
          <button onClick={() => removeCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C' }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {question.categories.length < 4 && (
        <button
          onClick={addCategory}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1448FF', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}
        >
          <Plus size={14} /> Add category
        </button>
      )}

      {/* Product selection + assignment */}
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(20,15,80,0.6)', margin: '8px 0 8px' }}>Products in this question</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shelfProducts.map((product) => {
          const assignment = question.productAssignments.find((a) => a.productId === product.id)
          const isIncluded = !!assignment
          return (
            <div key={product.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={isIncluded}
                onChange={() => toggleProduct(product.id)}
                id={`dd-${question.id}-${product.id}`}
                style={{ flexShrink: 0 }}
              />
              <label htmlFor={`dd-${question.id}-${product.id}`} style={{ fontSize: 12, color: '#140F50', flex: 1 }}>
                {product.name}
              </label>
              {isIncluded && (
                <select
                  value={assignment.categoryId ?? 'null'}
                  onChange={(e) => assignProduct(product.id, e.target.value)}
                  style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(20,15,80,0.2)' }}
                  aria-label={`Assign ${product.name} to category`}
                >
                  <option value="null">Distractor</option>
                  {question.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label || '(unnamed)'}</option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </div>

      <textarea
        value={question.explanation}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        placeholder="Explanation…"
        rows={2}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(20,15,80,0.15)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', marginTop: 12 }}
      />
    </div>
  )
}
