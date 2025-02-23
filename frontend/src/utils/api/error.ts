export async function handleApiError(response: Response): Promise<never> {
  const error = await response.json().catch(() => ({}));
  throw new Error(error.message || 'An unexpected error occurred');
}
