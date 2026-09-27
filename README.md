# atreyavedantam.github.io

This is my personal academic website: a single page built with plain Jekyll. GitHub Pages builds it on every push to `master`, and the live site is at <https://atreyavedantam.github.io>.

## Where to edit what

| To change… | Edit this file |
|---|---|
| Name, tagline, affiliation, email, links (Scholar, GitHub, LinkedIn, arXiv, X), photo, top-menu items | `_config.yml` |
| The **About / research interests** text at the top | `index.md` |
| **News** items | `_data/news.yml` |
| **Publications** (papers and preprints) | `_data/publications.yml` |
| **Research experience** (projects and advisors) | `_data/research.yml` |
| **Honors, service, teaching & leadership, beyond research** | `_data/more.yml` |
| CV PDF (the "CV" button) | replace `files/cv.pdf` |
| Profile photo | add e.g. `images/profile.jpg`, then set `photo: "/images/profile.jpg"` in `_config.yml` |
| Colors and fonts | the tokens at the top of `assets/css/style.css` (`--accent` is the link color) |
| Tab icon | `favicon.svg` |

Every `_data/*.yml` file begins with a comment that explains its fields. To add an entry, copy an existing block and edit it.

### Common tasks

**Add a news item.** Put it at the top of `_data/news.yml`:

```yaml
- date: "Oct 2026"
  text: "Our paper [Title](https://arxiv.org/abs/XXXX.XXXXX) was accepted at **ICLR 2027**!"
```

**Add a paper.** Add a block to `_data/publications.yml`. Use `section: "papers"` for accepted or published work and `section: "preprints"` for preprints and work in preparation. Your own name is bolded automatically.

```yaml
- title: "Paper title"
  authors: ["First Author", "Atreya Vedantam", "Last Author"]
  venue: "International Conference on Learning Representations (ICLR), 2027"
  tag: "ICLR 2027"
  section: "papers"
  links:
    arxiv: "https://arxiv.org/abs/XXXX.XXXXX"
    pdf: "/files/paper.pdf"
    code: "https://github.com/..."
```

**Move a preprint to papers once it's accepted.** Change its `section` to `"papers"`, then update `venue` and `tag`.

**Add a new section to the page** (for example "Talks"). Copy `_includes/news.html` to `_includes/talks.html` and create `_data/talks.yml`. Add `{% include talks.html %}` to `_layouts/default.html` and a `nav:` entry in `_config.yml`.

## File layout

```
_config.yml            site settings: name, links, photo, menu
index.md               About + research interests (Markdown)
_data/                 page content as YAML (news, publications, research, more)
_includes/             one HTML file per section (header, news, publications, …)
_layouts/default.html  page skeleton: nav, section order, footer, dark-mode toggle
assets/css/style.css   all styling (light and dark themes)
files/                 PDFs (CV, papers, slides)
images/                photos
404.html, favicon.svg
```

The files in `_includes/` and `_layouts/` read their content from `_config.yml` and `_data/`, so for normal updates you shouldn't need to touch them.

## Preview locally (optional)

```bash
bundle install
bundle exec jekyll serve     # then open http://localhost:4000
```

YAML is sensitive to indentation. If the site stops updating after a push, check **Actions → pages build and deployment** on GitHub for the error.
