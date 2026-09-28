# atreyavedantam.github.io

This is my personal academic website, built with plain Jekyll. GitHub Pages rebuilds it on every push to `master`, and the live site is at <https://atreyavedantam.github.io>.

Each tab in the top menu is its own page: **About, News, Publications, Research, Teaching, Service, Extracurriculars**.

## Where to edit what

| Tab / item | Page file (intro text + tab photos/videos) | Entries |
|---|---|---|
| **About** (home) | `index.md` | Honors: `_data/honors.yml` |
| **News** | `news.md` | `_data/news.yml` |
| **Publications** | `publications.md` | `_data/publications.yml` |
| **Research** | `research.md` | `_data/research.yml` |
| **Teaching** | `teaching.md` | `_data/teaching.yml` |
| **Service** | `service.md` | `_data/service.yml` |
| **Extracurriculars** | `extracurriculars.md` | `_data/extracurriculars.yml` |

| Other things | Where |
|---|---|
| Name, tagline, affiliation, email, links, tab order | `_config.yml` |
| **Profile photo** | upload a square image to `images/` (e.g. `images/profile.jpg`), then set `photo: "/images/profile.jpg"` in `_config.yml` |
| CV PDF (the "CV" button) | replace `files/cv.pdf` |
| Colors and fonts | tokens at the top of `assets/css/style.css` |

Every `_data/*.yml` file and every page file begins with a comment explaining its fields. To add an entry, copy an existing block and edit it.

## Photos and videos

Every tab can show photos and videos, in two places:

1. **For the whole tab.** Fill in the `media:` list at the top of the tab's page file (e.g. `extracurriculars.md`). These appear under "Photos & videos" at the bottom of the tab.
2. **For one entry.** Add a `media:` list to that entry in its `_data/*.yml` file. These appear right under the entry.

```yaml
media:
  - src: "/media/tennis-final.jpg"                 # upload the file to the media/ folder
    caption: "Inter-hostel final, 2024"
  - src: "https://www.youtube.com/watch?v=VIDEO_ID" # YouTube videos are embedded
  - src: "/media/talk.mp4"                          # .mp4 / .webm / .mov files get a player
```

Upload files to the `media/` folder (on GitHub: open the folder → **Add file → Upload files**). GitHub rejects files over 100 MB, so put long videos on YouTube and link them.

## Add a new tab

Copy `teaching.md` to e.g. `talks.md` and change its `title`, `permalink` and `section`. Create `_data/talks.yml` in the same format as `_data/teaching.yml`. Add a `{% when "talks" %}` line next to the others in `_layouts/default.html`, and add a `nav:` entry in `_config.yml`.

## Preview locally (optional)

```bash
bundle install
bundle exec jekyll serve     # then open http://localhost:4000
```

YAML is sensitive to indentation. If the site stops updating after a push, check **Actions → pages build and deployment** on GitHub for the error.
