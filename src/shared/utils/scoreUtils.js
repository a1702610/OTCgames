export function calculateGrade(percentage) {
  if (percentage >= 85) return { label: 'High Distinction', code: 'HD', color: '#27AE60' }
  if (percentage >= 75) return { label: 'Distinction',      code: 'D',  color: '#2980B9' }
  if (percentage >= 65) return { label: 'Credit',           code: 'C',  color: '#8E44AD' }
  if (percentage >= 50) return { label: 'Pass',             code: 'P',  color: '#E67E22' }
  return                       { label: 'Fail',             code: 'F',  color: '#E74C3C' }
}

export function formatScore(score, maxScore) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return { score, maxScore, percentage: pct, grade: calculateGrade(pct) }
}
