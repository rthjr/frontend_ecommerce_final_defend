import { http, HttpResponse } from 'msw'

export const handlers = [
  // Example handler to verify setup
  http.get('*/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),
]
