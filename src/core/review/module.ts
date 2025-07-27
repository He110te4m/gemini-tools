import type { ModuleReviewOptions } from '../../utils/validators'

export async function reviewModule(options: ModuleReviewOptions) {
  globalThis.console.log('reviewModule', options)
}
