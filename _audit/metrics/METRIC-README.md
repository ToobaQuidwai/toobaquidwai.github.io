# Website Audit — Per-Metric Reports

This directory contains one report per audit metric (METRIC-01 … METRIC-20).
Reports were produced by parallel subagents working off the CLAUDE.md
website-audit system prompt. Each report includes score (0–5), evidence
with file:line citations, failing items, remediation, and notes on
limitations encountered (primarily sandbox network restrictions that
prevented live browser runs and external URL verification).

See `../AUDIT-REPORT.md` (written after all 20 metrics complete) for
the aggregated scorecard.
