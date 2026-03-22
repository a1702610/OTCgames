import React from 'react'
import { getAllProductIds } from '../data/products.js'

const STORAGE_KEY = 'otc-builder-draft'

const initialState = {
  step: 0,                    // 0=Home, 1=Setup, 2=Authoring, 3=Preview, 4=Export
  moduleName: '',
  description: '',
  selectedShelfIds: [],
  scenarios: [],              // scenario objects
  quizQuestions: [],          // quiz question objects
  orphanedProductIds: new Set(), // product IDs that no longer exist in current library
  draftExists: false,
}

function serializeState(state) {
  return JSON.stringify({
    ...state,
    orphanedProductIds: [...state.orphanedProductIds],
  })
}

function deserializeState(json) {
  const parsed = JSON.parse(json)
  return {
    ...parsed,
    orphanedProductIds: new Set(parsed.orphanedProductIds || []),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_MODULE_NAME':
      return { ...state, moduleName: action.value }
    case 'SET_DESCRIPTION':
      return { ...state, description: action.value }
    case 'TOGGLE_SHELF': {
      const ids = state.selectedShelfIds
      const newIds = ids.includes(action.shelfId)
        ? ids.filter((id) => id !== action.shelfId)
        : [...ids, action.shelfId]
      return { ...state, selectedShelfIds: newIds }
    }
    case 'ADD_SCENARIO':
      return { ...state, scenarios: [...state.scenarios, action.scenario] }
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.map((s) => s.id === action.id ? { ...s, ...action.updates } : s),
      }
    case 'DELETE_SCENARIO':
      return { ...state, scenarios: state.scenarios.filter((s) => s.id !== action.id) }
    case 'ADD_QUIZ_QUESTION':
      return { ...state, quizQuestions: [...state.quizQuestions, action.question] }
    case 'UPDATE_QUIZ_QUESTION':
      return {
        ...state,
        quizQuestions: state.quizQuestions.map((q) => q.id === action.id ? { ...q, ...action.updates } : q),
      }
    case 'DELETE_QUIZ_QUESTION':
      return { ...state, quizQuestions: state.quizQuestions.filter((q) => q.id !== action.id) }
    case 'LOAD_FROM_IMPORT':
      return {
        ...state,
        moduleName: action.data.moduleName ?? state.moduleName,
        description: action.data.description ?? state.description,
        selectedShelfIds: action.data.selectedShelfIds ?? state.selectedShelfIds,
        scenarios: action.data.scenarios ?? state.scenarios,
        quizQuestions: action.data.quizQuestions ?? state.quizQuestions,
        orphanedProductIds: action.data.orphanedProductIds ?? state.orphanedProductIds,
        draftExists: true,
        step: 2,
      }
    case 'LOAD_FROM_DRAFT':
      return { ...action.draft, step: 1 }
    case 'CLEAR_DRAFT':
      return { ...initialState, draftExists: false }
    default:
      return state
  }
}

const BuilderContext = React.createContext(null)

export function BuilderProvider({ children }) {
  // Check localStorage for existing draft
  const [state, dispatch] = React.useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const draft = deserializeState(saved)
        return { ...draft, draftExists: true, step: 0 }
      }
    } catch {}
    return init
  })

  // Persist to localStorage on every state change (except step 0 home screen)
  React.useEffect(() => {
    if (state.step === 0 && !state.moduleName) return // don't save empty state
    try {
      localStorage.setItem(STORAGE_KEY, serializeState(state))
    } catch {}
  }, [state])

  const clearDraft = React.useCallback(function clearDraft() {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'CLEAR_DRAFT' })
  }, [dispatch])

  // Generate a simple unique ID
  const generateId = React.useCallback(function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }, [])

  // Import from .OTCgame file: extracts content.json, cross-references products
  const importFromFile = React.useCallback(async function importFromFile(file) {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(file)
    const contentFile = zip.file('content.json')
    if (!contentFile) throw new Error('content.json not found in file')
    const json = JSON.parse(await contentFile.async('string'))

    const currentProductIds = getAllProductIds()
    const orphaned = new Set()

    // Check scenarios
    json.scenarios?.forEach((s) => {
      if (s.bestChoiceProductId && !currentProductIds.has(s.bestChoiceProductId)) {
        orphaned.add(s.bestChoiceProductId)
      }
      s.acceptableProductIds?.forEach((id) => {
        if (!currentProductIds.has(id)) orphaned.add(id)
      })
    })
    // Check quiz drag-drop assignments
    json.quizQuestions?.forEach((q) => {
      q.productAssignments?.forEach((a) => {
        if (a.productId && !currentProductIds.has(a.productId)) orphaned.add(a.productId)
      })
    })

    dispatch({
      type: 'LOAD_FROM_IMPORT',
      data: {
        moduleName: json.module?.name || '',
        description: json.module?.description || '',
        selectedShelfIds: json.module?.selectedShelfIds || [],
        scenarios: json.scenarios || [],
        quizQuestions: json.quizQuestions || [],
        orphanedProductIds: orphaned,
        draftExists: true,
      },
    })
  }, [dispatch])

  const value = React.useMemo(
    () => ({ state, dispatch, clearDraft, generateId, importFromFile }),
    [state, clearDraft, generateId, importFromFile]
  )

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const ctx = React.useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used inside BuilderProvider')
  return ctx
}
