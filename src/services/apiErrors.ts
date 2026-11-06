/** apiClient preserves response/status on Error after translating Axios messages. */
function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : undefined;
}

export function apiErrorStatus(error: unknown): number | undefined {
  const value = record(error);
  const status = value?.status ?? record(value?.response)?.status;
  return typeof status === 'number' ? status : undefined;
}

export function apiErrorCode(error: unknown): string | undefined {
  const value = record(error);
  const data = record(value?.data ?? record(value?.response)?.data);
  const code = data?.code ?? data?.errorCode ?? data?.error_code;
  return typeof code === 'string' ? code : undefined;
}
