/**
 * The "New here? Read How to Play" banner on the title screen: shown until
 * the player opens How to Play or dismisses it, remembered per browser.
 */
const KEY = 'scp-battler:howto-seen:v1'

export function howToPromptShown(): boolean {
  try {
    return localStorage.getItem(KEY) === null
  } catch {
    return false // no storage: don't nag on every visit
  }
}

export function dismissHowToPrompt() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Only means the banner may show again.
  }
}
