import type { PrReviewOptions } from '../../utils/validators'

export async function reviewPr(options: PrReviewOptions) {
  globalThis.console.log('reviewPr', options)
}
