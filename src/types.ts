import type React from 'react'

export type Difficulty = '基础' | '提高' | '冲刺'
export type QuestionGroup = 'game1' | 'game2'

export type QuestionDef = {
  group: QuestionGroup
  qid: string // e.g. q1
  title: string
  difficulty: Difficulty
  tags: string[]
  /** 题目描述（会显示在页面上） */
  prompt: string
  /** 本题考查的知识点（会显示在页面上） */
  knowledge: string[]
  /** 一句话摘要（用于顶部概览） */
  summary: string
  Component: React.FC
}
