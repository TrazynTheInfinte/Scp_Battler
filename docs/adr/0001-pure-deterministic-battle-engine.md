# Battle engine is a pure, deterministic module

The battle engine has no UI, DOM, network, or wall-clock dependencies: given a battle state, both sides' choices, and a seeded RNG, it always produces the same next state. Phase 1 is single player vs AI only, so this looks like overkill — but it lets phase 2 online play (on Firebase) reuse the exact same engine, either on a server or by having both clients run it in lockstep from shared choices and a shared seed, with no rewrite. It also makes the engine fully unit-testable and battles replayable from a seed.
