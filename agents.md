# Lightship Fund Analysis App – Codex Agent Instructions

This is an internal React-based web app used by a wealth management team to evaluate and score mutual funds and ETFs each month.

The full project overview is in [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md). Please read that file first.

Key goals for this app:
- Use uploaded monthly fund performance data to rank funds by asset class using a weighted Z-score model
- Display results visually in heatmaps and top/bottom tables
- Compare funds against assigned asset class benchmarks
- Automatically tag underperformers or expensive funds
- Let us manage fund-to-class and benchmark mappings via an Admin tab

All fund data comes from Raymond James, and sample files are in `/data/`.

Agents should:
- Propose enhancements one at a time
- Wait for confirmation before writing new code
- Follow component folder structure under `src/components/`
- Prioritize clarity, usability, and sustainability

The primary user is Tristan Ryan. He prefers detailed, step-by-step guidance when reviewing suggestions or testing code.
