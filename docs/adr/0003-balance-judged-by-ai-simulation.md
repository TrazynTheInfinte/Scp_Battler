# Balance is judged by AI-vs-AI simulation, gated in CI

The roster is meant to grow in waves toward hundreds of SCPs, too many to balance by hand or by playtesting alone. So balance is measured by simulating thousands of AI-vs-AI battles between random legal teams, with every SCP guaranteed a minimum number of battles, and a test fails the build when an SCP sweeps too often, an SCP's win rate leaves a set band, or a team makeup by object class wins too often. Playtest feedback still drives changes, but a wave can't ship while the simulation flags it.

## Consequences

- The AI is the measuring instrument, so its blind spots become balance blind spots: an SCP whose strength depends on a tactic the AI never uses (e.g. stat-boosting before it learned to) looks weaker in simulation than in human hands. Improving the AI can shift balance results without any roster change.
- Changing the AI, the battle rules, or the roster can turn the balance test red; that is intended, and the fix is a roster or rules change, not loosening the thresholds.
