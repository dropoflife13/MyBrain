---
type: architecture
version: 1
status: active
---
# Cortex Architecture (The 4 Layers)

1. **The Architect (Human)**: The ultimate source of truth. Writes the rules, takes the assessments, and dictates the constraints.
2. **The Vault (Memory)**: The Markdown files containing raw knowledge and context. It never forgets.
3. **The 7 Agents (The Constitution)**: Deterministic guardrails. They do not "write" code; they act as a compiler that rejects code violating invariants (e.g., GATE: FAIL DB-01).
4. **The AI Model (The CPU)**: The raw compute engine (Gemini/NVIDIA). It is replaceable and subservient to the Constitution. 

## Design Principles
- The AI is the muscle, not the brain.
- Rules are weighted by evidence, not volume. A proven rule is worth 5 unproven guesses.
- If the Constitution (Agents) is missing, the system must halt immediately (BN-00). No ungoverned execution.

