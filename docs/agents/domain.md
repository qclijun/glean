# Domain docs

## Layout

Single-context: the root `GLOSSARY.md` holds domain terminology; `docs/adr/` holds architecture decisions.

## Consumer rules

- Before domain exploration, read `GLOSSARY.md` and ADRs relevant to the task.
- If a `GLOSSARY-MAP.md` is introduced later, follow it to the relevant context glossary and ADRs.
- If domain documents are absent, proceed silently. Create them lazily through `/domain-modeling` when terminology or decisions are actually resolved.
- Use glossary terms consistently in issues, hypotheses, proposals and tests. Reconsider invented synonyms; record genuine terminology gaps for `/domain-modeling`.
- Surface conflicts with existing ADRs explicitly, identifying the ADR and the reason to reopen its decision.
