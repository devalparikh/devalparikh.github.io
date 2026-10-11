# Notes sync

Notes come from `devalparikh/Wiki`, branch `main`. The site publishes nonempty
Markdown files under `knowledge/`. Templates, hidden folders, README files, private
folders, draft folders, and notes with any of these frontmatter values are excluded:

```yaml
private: true
draft: true
status: draft # status: private also excludes a note
publish: false # published: false also excludes a note
```

Obsidian `%%comments%%` are removed. Code fences, tables, task lists, callouts,
wikilinks, aliases, heading links, and referenced images are supported. Note embeds
become links to their pages. Canvas files and missing attachments display their
labels. Links to missing or excluded notes display as text. Raw HTML is not rendered.

## Enable automatic updates

Add two fine-grained GitHub personal access tokens as Actions secrets. Do not put
either token in the repository or in a `NEXT_PUBLIC_` environment variable.

1. In **devalparikh.github.io**, set `WIKI_READ_TOKEN`. Select only the **Wiki**
   repository and grant **Contents: Read-only**.
2. In **Wiki**, set `SITE_DEPLOY_TOKEN`. Select only **devalparikh.github.io** and
   grant **Actions: Read and write**. This lets the Wiki workflow dispatch the
   site's existing deployment workflow.
3. Merge both workflow changes. Push a change under `Wiki/knowledge/`, or manually
   run Wiki's **Update public notes** workflow once.

After each relevant push to Wiki's `main`, its workflow requests a site deployment.
The site fetches the latest complete Wiki tree, reads immutable blobs from that
revision, regenerates the notes and referenced images, and builds GitHub Pages.
The same sync runs on site pushes, manual deployments, and a daily retry schedule.
Expect updates after the Actions build and Pages deployment finish, not immediately
after the push. The Wiki dispatch job confirms the request; check the site's
deployment run for the final result.

Edits replace content; deletions and newly excluded notes remove their routes on
the next successful deployment. Renamed notes get new URLs. Incoming links are
resolved again on every build. Failed reads or invalid YAML fail the build and
leave the last successful deployment online. A missing CI token also fails the
build, so a Wiki push cannot silently republish stale notes. Renew expired tokens
in the corresponding repository's Actions secrets.

Previously published content can remain in browser caches and Git history after
it is withdrawn. Only put content intended for public readers in eligible notes.

## Develop locally

```bash
WIKI_VAULT_PATH=/path/to/Wiki npm run notes:sync
npm run dev
```

Alternatively, supply `WIKI_READ_TOKEN` to `npm run notes:sync`. Without a local
vault or token, local development uses the checked-in public snapshot. CI always
requires a fresh sync. Local changes to the vault appear after rerunning the sync
command, or restarting `npm run dev` with `WIKI_VAULT_PATH` set.

`src/content/notes.generated.json` and `public/img/notes/` are generated. They
contain only selected public content. The snapshot gives contributors a working
preview without private repository access. Update the snapshot with `notes:sync`
when updating it in a pull request. CI regenerates it in the build workspace.

## Verify

```bash
npm run test:notes
npm run lint
npm run typecheck
npm run build
```

## Notes navigation and search

The importer also generates the folder hierarchy, heading IDs/table of contents,
and the link graph from the same published notes. Incoming and outgoing links
appear in each note's local graph; the index has a complete graph with pan/zoom.
The explorer and table of contents start open on desktop and fold above the note
on smaller screens. The current heading follows scrolling.

Cmd/Ctrl K, or the search icon in the navigation, opens site search on every page.
It searches page titles, projects, experience, writing, and published note text.
Exact titles rank first. Arrow keys select a result, Enter opens it, and Escape
closes search and returns focus. Project results link directly to their drawers.

`notes:sync` writes `public/notes-search.json` after filtering the vault. This
untracked file is rebuilt for both development and production; browsers request
it only when search opens. It contains public text only, not note HTML or vault
credentials. No additional GitHub secrets or external search service are needed.
