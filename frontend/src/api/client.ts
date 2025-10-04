import { z } from 'zod';
import {
  HttpErrorSchema,
  ParameterExtractionRequestSchema,
  ParameterExtractionResponseSchema,
  OrchestrationRequestSchema,
  OrchestrationResponseSchema
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiClient {
  private readonly baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async post<TReqSchema extends z.ZodTypeAny, TResSchema extends z.ZodTypeAny>(
    path: string,
    reqSchema: TReqSchema,
    resSchema: TResSchema,
    body: z.infer<TReqSchema>,
    init?: RequestInit
  ): Promise<z.infer<TResSchema>> {
    const parsed = reqSchema.safeParse(body);
    if (!parsed.success) {
      throw this.error(400, 'BAD_REQUEST', 'Request schema validation failed', parsed.error.flatten());
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      },
      body: JSON.stringify(parsed.data),
      ...init
    });

    if (!res.ok) {
      const maybeJson = await this.safeJson(res);
      throw this.error(res.status, maybeJson?.code || 'HTTP_ERROR', maybeJson?.message || res.statusText, maybeJson?.details);
    }

    const json = await res.json();
    const validated = resSchema.safeParse(json);
    if (!validated.success) {
      throw this.error(500, 'SCHEMA_ERROR', 'Response schema validation failed', validated.error.flatten());
    }
    return validated.data;
  }

  async safeJson(res: Response): Promise<any | null> {
    try { return await res.json(); } catch { return null; }
  }

  error(status: number, code: string, message: string, details?: unknown) {
    const err = { status, code, message, details };
    const parsed = HttpErrorSchema.safeParse(err);
    return Object.assign(new Error(parsed.success ? parsed.data.message : message), parsed.success ? parsed.data : err);
  }

  // High-level endpoints
  async extract(body: z.infer<typeof ParameterExtractionRequestSchema>) {
    return this.post('/extract', ParameterExtractionRequestSchema, ParameterExtractionResponseSchema, body);
  }

  async orchestrate(body: z.infer<typeof OrchestrationRequestSchema>) {
    return this.post('/orchestrate', OrchestrationRequestSchema, OrchestrationResponseSchema, body);
  }
}

export const apiClient = new ApiClient();
