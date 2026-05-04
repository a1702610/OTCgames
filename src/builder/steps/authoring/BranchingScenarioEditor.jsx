import React from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Trash2, Plus, Sparkles, Upload, X, ChevronDown, ChevronUp } from 'lucide-react'
import { generateBranchingScenario } from '../../services/geminiService.js'
import { extractTextFromPdf } from '../../services/pdfExtractor.js'

// ─── Node type renderers ──────────────────────────────────────────────────────

function StartNode({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1448FF 0%, #836BFF 100%)',
      border: '2px solid rgba(131,107,255,0.60)',
      borderRadius: 12, padding: '10px 16px',
      minWidth: 180, textAlign: 'center',
      boxShadow: '0 4px 20px rgba(20,72,255,0.35)',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>🏥</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#836BFF' }} />
    </div>
  )
}

function QuestionNode({ data, selected }) {
  return (
    <div
      onClick={data.onSelect}
      style={{
        background: selected ? 'rgba(131,107,255,0.18)' : 'rgba(20,15,80,0.07)',
        border: `2px solid ${selected ? '#836BFF' : 'rgba(20,15,80,0.18)'}`,
        borderRadius: 12, padding: '10px 14px',
        minWidth: 200, maxWidth: 240,
        cursor: 'pointer',
        boxShadow: selected ? '0 0 0 3px rgba(131,107,255,0.20)' : 'none',
        transition: 'border-color 0.15s',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#836BFF' }} />
      <div style={{ fontSize: 10, fontWeight: 700, color: '#836BFF', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Node {data.nodeId}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(20,15,80,0.80)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {data.question || <span style={{ color: 'rgba(20,15,80,0.28)', fontStyle: 'italic' }}>No question yet</span>}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(20,15,80,0.35)', marginTop: 6 }}>
        {data.choiceCount} choice{data.choiceCount !== 1 ? 's' : ''}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#836BFF' }} />
    </div>
  )
}

function EndNode({ data }) {
  const isSuccess = data.score > 0
  return (
    <div style={{
      background: isSuccess ? 'rgba(39,174,96,0.15)' : 'rgba(231,76,60,0.12)',
      border: `2px solid ${isSuccess ? 'rgba(39,174,96,0.50)' : 'rgba(231,76,60,0.45)'}`,
      borderRadius: 12, padding: '10px 16px',
      minWidth: 160, textAlign: 'center',
      boxShadow: isSuccess ? '0 4px 16px rgba(39,174,96,0.20)' : '0 4px 16px rgba(231,76,60,0.15)',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: isSuccess ? '#27AE60' : '#E74C3C' }} />
      <div style={{ fontSize: 18, marginBottom: 4 }}>{isSuccess ? '🎉' : '❌'}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: isSuccess ? '#5dda8a' : '#f87171' }}>
        {data.label}
      </div>
      {data.score > 0 && (
        <div style={{ fontSize: 10, color: 'rgba(20,15,80,0.45)', marginTop: 2 }}>+{data.score} pts</div>
      )}
    </div>
  )
}

const NODE_TYPES = { start: StartNode, question: QuestionNode, end: EndNode }

// ─── Layout helper ────────────────────────────────────────────────────────────

function buildReactFlowElements(scenario, selectedNodeId, onSelectNode) {
  if (!scenario) return { nodes: [], edges: [] }

  const rfNodes = []
  const rfEdges = []

  // Start screen node
  rfNodes.push({
    id: 'start',
    type: 'start',
    position: { x: 260, y: 0 },
    data: { label: scenario.start_screen?.title || scenario.title || 'Start' },
    draggable: true,
  })

  // End screen nodes
  const endScreens = scenario.end_screens || []
  endScreens.forEach((es, idx) => {
    rfNodes.push({
      id: `end_${es.id}`,
      type: 'end',
      position: { x: 80 + idx * 280, y: 600 },
      data: { label: es.title || (es.score > 0 ? 'Success' : 'Failure'), score: es.score ?? 0 },
      draggable: true,
    })
  })

  // Build BFS levels for positioning question nodes
  const nodes = scenario.nodes || []
  const levelOf = {}
  const posInLevel = {}
  const queue = [0]
  levelOf[0] = 0
  while (queue.length) {
    const nid = queue.shift()
    const node = nodes.find((n) => n.id === nid)
    if (!node) continue
    node.choices?.forEach((c) => {
      if (c.next_node >= 0 && levelOf[c.next_node] === undefined) {
        levelOf[c.next_node] = (levelOf[nid] || 0) + 1
        queue.push(c.next_node)
      }
    })
  }
  // Count nodes per level for x positioning
  const levelCount = {}
  nodes.forEach((n) => {
    const lv = levelOf[n.id] ?? 0
    levelCount[lv] = (levelCount[lv] || 0) + 1
    posInLevel[n.id] = levelCount[lv] - 1
  })

  nodes.forEach((node) => {
    const lv = levelOf[node.id] ?? 0
    const pos = posInLevel[node.id] ?? 0
    const totalInLevel = levelCount[lv] || 1
    const x = (pos - (totalInLevel - 1) / 2) * 280 + 260
    const y = 120 + lv * 170

    rfNodes.push({
      id: `node_${node.id}`,
      type: 'question',
      position: { x, y },
      data: {
        nodeId: node.id,
        question: node.question,
        choiceCount: node.choices?.length || 0,
        onSelect: () => onSelectNode(node.id),
      },
      selected: selectedNodeId === node.id,
      draggable: true,
    })
  })

  // Start → node 0 edge
  if (nodes.length > 0) {
    rfEdges.push({
      id: 'start_to_0',
      source: 'start',
      target: 'node_0',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#836BFF' },
      style: { stroke: '#836BFF', strokeWidth: 2 },
      animated: true,
    })
  }

  // Choice edges
  nodes.forEach((node) => {
    node.choices?.forEach((choice, ci) => {
      const targetId = choice.next_node < 0 ? `end_${choice.next_node}` : `node_${choice.next_node}`
      const isEndEdge = choice.next_node < 0
      const endScreen = isEndEdge ? endScreens.find((e) => e.id === choice.next_node) : null
      const isSuccess = endScreen?.score > 0
      const edgeColor = isEndEdge ? (isSuccess ? '#27AE60' : '#E74C3C') : 'rgba(20,15,80,0.28)'

      rfEdges.push({
        id: `edge_${node.id}_${ci}`,
        source: `node_${node.id}`,
        target: targetId,
        label: choice.text.length > 28 ? choice.text.slice(0, 25) + '…' : choice.text,
        labelStyle: { fill: 'rgba(20,15,80,0.60)', fontSize: 10 },
        labelBgStyle: { fill: 'rgba(12,10,56,0.85)', fillOpacity: 1 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
        style: { stroke: edgeColor, strokeWidth: 1.5 },
      })
    })
  })

  return { nodes: rfNodes, edges: rfEdges }
}

// ─── Node sidebar editor ──────────────────────────────────────────────────────

function NodeSidebar({ scenario, selectedNodeId, onUpdateScenario, onClose }) {
  const node = scenario.nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const allNodeIds = scenario.nodes.map((n) => n.id)
  const endIds = scenario.end_screens.map((e) => e.id)

  function updateNode(updates) {
    onUpdateScenario({
      nodes: scenario.nodes.map((n) => n.id === selectedNodeId ? { ...n, ...updates } : n),
    })
  }

  function updateChoice(ci, updates) {
    const choices = node.choices.map((c, i) => i === ci ? { ...c, ...updates } : c)
    updateNode({ choices })
  }

  function addChoice() {
    if ((node.choices?.length || 0) >= 4) return
    const choices = [...(node.choices || []), { text: '', next_node: null, feedback_title: '', feedback_body: '' }]
    updateNode({ choices })
  }

  function removeChoice(ci) {
    updateNode({ choices: node.choices.filter((_, i) => i !== ci) })
  }

  function deleteNode() {
    // Remove node and any choices pointing to it from other nodes
    const newNodes = scenario.nodes
      .filter((n) => n.id !== selectedNodeId)
      .map((n) => ({
        ...n,
        choices: n.choices.map((c) => c.next_node === selectedNodeId ? { ...c, next_node: null } : c),
      }))
    onUpdateScenario({ nodes: newNodes })
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '7px 10px', borderRadius: 7,
    border: '1.5px solid rgba(255,255,255,0.12)', fontSize: 12,
    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.90)',
    boxSizing: 'border-box', resize: 'vertical',
  }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 4 }

  return (
    <div style={{
      width: 300, flexShrink: 0,
      background: 'rgba(20,15,80,0.96)', borderLeft: '1px solid rgba(255,255,255,0.08)',
      overflowY: 'auto', padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#836BFF' }}>Node {selectedNodeId}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={deleteNode} title="Delete node" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)' }}>
            <Trash2 size={14} />
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Question text */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Question / Scenario text</label>
        <textarea
          value={node.question || ''}
          onChange={(e) => updateNode({ question: e.target.value })}
          placeholder="Describe the clinical situation and ask the learner what they would do…"
          rows={5}
          style={inputStyle}
        />
      </div>

      {/* Choices */}
      <div>
        <p style={{ ...labelStyle, marginBottom: 8 }}>Choices ({node.choices?.length || 0}/4)</p>
        {(node.choices || []).map((choice, ci) => (
          <div key={ci} style={{ marginBottom: 12, padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#836BFF' }}>
                {String.fromCharCode(65 + ci)}
              </span>
              <button onClick={() => removeChoice(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)' }}>
                <X size={12} />
              </button>
            </div>

            <label style={labelStyle}>Choice text</label>
            <input
              type="text"
              value={choice.text || ''}
              onChange={(e) => updateChoice(ci, { text: e.target.value })}
              placeholder="What the learner does or says"
              style={{ ...inputStyle, resize: undefined, marginBottom: 6 }}
            />

            <label style={labelStyle}>Leads to</label>
            <select
              value={choice.next_node ?? ''}
              onChange={(e) => {
                const val = e.target.value
                updateChoice(ci, { next_node: val === '' ? null : parseInt(val, 10) })
              }}
              style={{ ...inputStyle, resize: undefined, marginBottom: 6, cursor: 'pointer' }}
            >
              <option value="">— select next —</option>
              {allNodeIds.filter((id) => id !== selectedNodeId).map((id) => (
                <option key={id} value={id}>Node {id}</option>
              ))}
              {endIds.map((id) => {
                const es = scenario.end_screens.find((e) => e.id === id)
                return <option key={id} value={id}>{es?.score > 0 ? '✓ Success' : '✗ Failure'} (end)</option>
              })}
            </select>

            <label style={labelStyle}>Feedback title</label>
            <input
              type="text"
              value={choice.feedback_title || ''}
              onChange={(e) => updateChoice(ci, { feedback_title: e.target.value })}
              placeholder="e.g. Good reasoning"
              style={{ ...inputStyle, resize: undefined, marginBottom: 6 }}
            />

            <label style={labelStyle}>Feedback body</label>
            <textarea
              value={choice.feedback_body || ''}
              onChange={(e) => updateChoice(ci, { feedback_body: e.target.value })}
              placeholder="1-2 sentences explaining why this choice was correct or incorrect"
              rows={3}
              style={inputStyle}
            />
          </div>
        ))}
        {(node.choices?.length || 0) < 4 && (
          <button
            onClick={addChoice}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7da5ff', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={13} /> Add choice
          </button>
        )}
      </div>
    </div>
  )
}

// ─── AI generation panel ──────────────────────────────────────────────────────

function AIPanel({ onGenerated, onClose }) {
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('otc-gemini-key') || '')
  const [file, setFile] = React.useState(null)
  const [customInstructions, setCustomInstructions] = React.useState('')
  const [status, setStatus] = React.useState('idle') // 'idle' | 'extracting' | 'generating' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = React.useState('')
  const fileRef = React.useRef()

  async function handleGenerate() {
    if (!apiKey.trim()) { setErrorMsg('Enter your Gemini API key'); return }
    if (!file) { setErrorMsg('Upload a PDF or text file'); return }
    localStorage.setItem('otc-gemini-key', apiKey.trim())
    setErrorMsg('')

    try {
      setStatus('extracting')
      let text = ''
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file)
      } else {
        text = await file.text()
      }

      if (!text.trim()) throw new Error('No text could be extracted from the file.')

      setStatus('generating')
      const scenario = await generateBranchingScenario(apiKey.trim(), text, customInstructions)
      setStatus('done')
      onGenerated(scenario)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || String(err))
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 11px', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.12)', fontSize: 12,
    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.90)',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 20,
      background: 'rgba(20,15,80,0.96)', border: '1px solid rgba(131,107,255,0.30)',
      borderRadius: 16, padding: 20, width: 300,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.50)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#836BFF', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} /> AI Generate
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)' }}>
          <X size={16} />
        </button>
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 4 }}>
        Gemini API Key
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="AIza…"
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 4 }}>
        Source document (PDF or .txt)
      </label>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: '1.5px dashed rgba(255,255,255,0.20)', borderRadius: 8,
          padding: '10px 12px', cursor: 'pointer', marginBottom: 10,
          background: 'rgba(255,255,255,0.05)', textAlign: 'center',
        }}
      >
        <Upload size={16} style={{ color: 'rgba(255,255,255,0.40)', marginBottom: 4 }} />
        <div style={{ fontSize: 12, color: file ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)' }}>
          {file ? file.name : 'Click to upload PDF or .txt'}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
      </div>

      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.50)', display: 'block', marginBottom: 4 }}>
        Focus / custom instructions (optional)
      </label>
      <textarea
        value={customInstructions}
        onChange={(e) => setCustomInstructions(e.target.value)}
        placeholder="e.g. Focus on contraindications for elderly patients"
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }}
      />

      {errorMsg && (
        <p style={{ fontSize: 12, color: '#f87171', margin: '0 0 10px' }}>{errorMsg}</p>
      )}

      {status === 'extracting' && (
        <p style={{ fontSize: 12, color: '#836BFF', margin: '0 0 10px' }}>📄 Extracting text…</p>
      )}
      {status === 'generating' && (
        <p style={{ fontSize: 12, color: '#836BFF', margin: '0 0 10px' }}>✨ Generating scenario with Gemini…</p>
      )}
      {status === 'done' && (
        <p style={{ fontSize: 12, color: '#5dda8a', margin: '0 0 10px' }}>✓ Scenario generated!</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={status === 'extracting' || status === 'generating'}
        style={{
          width: '100%', background: status === 'extracting' || status === 'generating' ? 'rgba(131,107,255,0.30)' : '#836BFF',
          color: '#FFFFFF', border: 'none', borderRadius: 9,
          padding: '9px 0', fontWeight: 700, fontSize: 13, cursor: status === 'extracting' || status === 'generating' ? 'default' : 'pointer',
        }}
      >
        {status === 'extracting' ? 'Extracting…' : status === 'generating' ? 'Generating…' : '✨ Generate Scenario'}
      </button>
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function BranchingScenarioEditor({ scenario, onUpdate, onDelete }) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = React.useState(null)
  const [showAI, setShowAI] = React.useState(false)
  const [expanded, setExpanded] = React.useState(true)

  // Sync React Flow state from scenario
  React.useEffect(() => {
    const { nodes, edges } = buildReactFlowElements(scenario, selectedNodeId, setSelectedNodeId)
    setRfNodes(nodes)
    setRfEdges(edges)
  }, [scenario, selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  function addNode() {
    const newId = (scenario.nodes?.length > 0
      ? Math.max(...scenario.nodes.map((n) => n.id)) + 1
      : 0)
    const newNode = { id: newId, question: '', choices: [] }
    onUpdate({ nodes: [...(scenario.nodes || []), newNode] })
    setSelectedNodeId(newId)
  }

  function handleAIGenerated(generatedScenario) {
    // Replace title, start_screen, nodes, end_screens with AI result
    onUpdate({
      title: generatedScenario.title,
      start_screen: generatedScenario.start_screen,
      nodes: generatedScenario.nodes,
      end_screens: generatedScenario.end_screens,
    })
    setShowAI(false)
    setSelectedNodeId(null)
  }

  const selectedNode = scenario.nodes?.find((n) => n.id === selectedNodeId)

  return (
    <div style={{ background: 'rgba(20,15,80,0.50)', border: '1px solid rgba(131,107,255,0.20)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header */}
      <div
        style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20,15,80,0.60)', cursor: 'pointer', borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
          🌿 {scenario.title || 'Untitled Branching Scenario'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)' }}
            aria-label="Delete scenario"
          >
            <Trash2 size={15} />
          </button>
          {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.45)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.45)" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Title + start screen edit */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={scenario.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Scenario title"
              style={{ flex: 2, minWidth: 160, padding: '7px 11px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 13, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.90)' }}
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="text"
              value={scenario.start_screen?.subtitle || ''}
              onChange={(e) => onUpdate({ start_screen: { ...scenario.start_screen, subtitle: e.target.value } })}
              placeholder="Start screen subtitle (patient intro)"
              style={{ flex: 3, minWidth: 200, padding: '7px 11px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 13, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.90)' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Toolbar */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={addNode}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#7da5ff', background: 'rgba(20,72,255,0.12)', border: '1px solid rgba(20,72,255,0.25)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}
            >
              <Plus size={13} /> Add Node
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowAI(!showAI) }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#836BFF', background: 'rgba(131,107,255,0.12)', border: '1px solid rgba(131,107,255,0.25)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer' }}
            >
              <Sparkles size={13} /> Generate with AI
            </button>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', marginLeft: 4 }}>
              {scenario.nodes?.length || 0} nodes · click a node to edit
            </span>
          </div>

          {/* Graph + Sidebar */}
          <div style={{ display: 'flex', height: 500, position: 'relative' }}>
            <div style={{ flex: 1, background: 'transparent' }}>
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={NODE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                style={{ background: 'transparent' }}
                onClick={(e) => {
                  // Deselect if clicking canvas directly
                  if (e.target.classList.contains('react-flow__pane')) setSelectedNodeId(null)
                }}
              >
                <Background color="rgba(255,255,255,0.05)" gap={24} />
                <Controls
                  style={{ background: 'rgba(12,10,56,0.90)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
                <MiniMap
                  style={{ background: 'rgba(12,10,56,0.90)', border: '1px solid rgba(255,255,255,0.10)' }}
                  nodeColor={(n) => {
                    if (n.type === 'start') return '#1448FF'
                    if (n.type === 'end') return n.data.score > 0 ? '#27AE60' : '#E74C3C'
                    return '#836BFF'
                  }}
                />
              </ReactFlow>

              {showAI && (
                <AIPanel
                  onGenerated={handleAIGenerated}
                  onClose={() => setShowAI(false)}
                />
              )}
            </div>

            {selectedNode && (
              <NodeSidebar
                scenario={scenario}
                selectedNodeId={selectedNodeId}
                onUpdateScenario={onUpdate}
                onClose={() => setSelectedNodeId(null)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
