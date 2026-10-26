# Issue tracker: GitHub

Issues and specs live in https://github.com/qclijun/glean/issues. Use the `gh` CLI with `--repo qclijun/glean`.

## Conventions

- Create: `gh issue create --repo qclijun/glean --title "..." --body-file <file>`.
- Read: `gh issue view <number> --repo qclijun/glean --json number,title,body,labels,comments`.
- List: `gh issue list --repo qclijun/glean --state open --json number,title,body,labels,comments`, with relevant label filters.
- Comment: `gh issue comment <number> --repo qclijun/glean --body-file <file>`.
- Label: `gh issue edit <number> --repo qclijun/glean --add-label <label>` or `--remove-label <label>`.
- Close: `gh issue close <number> --repo qclijun/glean`.
- Write multiline bodies to a temporary UTF-8 file and pass `--body-file`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

"Publish to the issue tracker" means create a GitHub issue. "Fetch the relevant ticket" means read the referenced GitHub issue.

## Wayfinding operations

- Map: one issue labeled `wayfinder:map`, containing Notes, Decisions-so-far and Fog.
- Children: separate issues linked to their parent using `gh issue create --parent <parent>`, labeled `wayfinder:<type>` (`research`, `prototype`, `grilling`, `task`). Where sub-issues are unavailable, use a parent task list and `Part of #<parent>` in each child.
- Blocking: use native GitHub issue dependencies. Add with `gh api --method POST repos/qclijun/glean/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`; obtain the database ID with `gh api repos/qclijun/glean/issues/<number> --jq .id`. Where unavailable, record `Blocked by: #<number>` in the issue body.
- Frontier: choose the first open child in map order with no open blockers and no assignee.
- Claim: assign the issue to `@me` before work.
- Resolve: append the answer, close the child, then add a short answer and link to the map's Decisions-so-far.
