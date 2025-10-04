import { z } from 'zod';

export const HttpErrorSchema = z.object({
  status: z.number(),
  code: z.string().optional(),
  message: z.string(),
  details: z.unknown().optional()
});
export type HttpError = z.infer<typeof HttpErrorSchema>;

export const ParameterExtractionRequestSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    studentId: z.string().optional(),
    sessionId: z.string().optional(),
    teachingStyle: z.enum(['socratic', 'directive', 'exploratory']).optional(),
    emotionalState: z.enum(['engaged', 'frustrated', 'neutral']).optional(),
    masteryLevel: z.number().min(1).max(10).optional()
  }).optional()
});
export type ParameterExtractionRequest = z.infer<typeof ParameterExtractionRequestSchema>;

export const ParameterExtractionResponseSchema = z.object({
  intent: z.string(),
  tool: z.enum(['note_maker', 'flashcard_generator', 'chat']).optional(),
  parameters: z.record(z.any()).default({}),
  trace: z.array(z.string()).default([])
});
export type ParameterExtractionResponse = z.infer<typeof ParameterExtractionResponseSchema>;

export const OrchestrationRequestSchema = z.object({
  tool: z.enum(['note_maker', 'flashcard_generator', 'chat']),
  parameters: z.record(z.any()).default({}),
  sessionId: z.string().optional(),
  includeTrace: z.boolean().optional()
});
export type OrchestrationRequest = z.infer<typeof OrchestrationRequestSchema>;

export const OrchestrationResponseSchema = z.object({
  result: z.any(),
  normalized: z.object({
    title: z.string().optional(),
    text: z.string().optional(),
    items: z.array(z.any()).optional()
  }).default({}),
  trace: z.array(z.string()).default([])
});
export type OrchestrationResponse = z.infer<typeof OrchestrationResponseSchema>;

export const SessionStateSchema = z.object({
  sessionId: z.string(),
  studentId: z.string().optional(),
  teachingStyle: z.enum(['socratic', 'directive', 'exploratory']).default('socratic'),
  emotionalState: z.enum(['engaged', 'frustrated', 'neutral']).default('neutral'),
  masteryLevel: z.number().min(1).max(10).default(5),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).default([])
});
export type SessionState = z.infer<typeof SessionStateSchema>;
