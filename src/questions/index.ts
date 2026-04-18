import type { QuestionDef, QuestionGroup } from '../types'
import { game1Questions } from './game1'
import { game2Questions } from './game2'

export const questionsByGroup: Record<QuestionGroup, QuestionDef[]> = {
  game1: game1Questions,
  game2: game2Questions,
}

export function getQuestion(
  group: string | undefined,
  qid: string | undefined
): QuestionDef | null {
  if (!group || !qid) return null
  if (group !== 'game1' && group !== 'game2') return null
  return questionsByGroup[group].find((q) => q.qid === qid) ?? null
}

