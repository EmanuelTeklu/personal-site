# JaneHive 3-Agent Runtime

Use `run-workflow.sh` with workflow YAML files from `ops/workflows`.

Example:
```bash
ops/agents3/run-workflow.sh --workflow ops/workflows/fix-cc-full.yaml --simulate --auto-select A
```

Agents:
- ARCHITECT: workflow + memory
- BUILDER: source/artifact mutation
- CRITIC: audit + gates
