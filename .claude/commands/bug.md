# Bug: file a GitHub bug issue

Turn a description of something broken into a clean issue in this repository.

## Usage

```
/bug <description>     # draft and file
/bug draft <desc>      # print the report only, create nothing
```

## Steps

1. Search open and closed issues and open PRs for a duplicate (`gh issue list --state all
   --search "<keywords>"`, `gh pr list --state open --search "<keywords>"`). If a match is open,
   comment on it instead of filing a second one, and say which.
2. Draft: title (imperative, no issue numbers), summary, current behaviour, expected behaviour,
   steps to reproduce, environment (web, mobile, MCP client, prod or preview), evidence. Mark
   unknowns as unknown. Quote errors verbatim.
3. Redact before showing or filing: API keys (`er_...`), session cookies, Stripe and Replicate
   identifiers, customer emails and photos. If it cannot be redacted without gutting the report,
   stop and say so.
4. File with `gh issue create` and return the URL.
