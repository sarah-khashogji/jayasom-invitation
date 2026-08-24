#!/usr/bin/env python3
"""Assemble the Jayasom invitation from src/ into two outputs:
   dist/artifact.html  — fragment (no doctype/html/head/body) for Artifact publishing
   dist/index.html     — full standalone document, deployable / openable locally
"""
import pathlib, json, re

root = pathlib.Path(__file__).parent
src = root / 'src'
dist = root / 'dist'
dist.mkdir(exist_ok=True)

head = (src / 'head.html').read_text(encoding='utf-8')
body = (src / 'body.html').read_text(encoding='utf-8')
js   = (src / 'script.js').read_text(encoding='utf-8')
logo = (src / 'logo_paths.html').read_text(encoding='utf-8').strip()
cons = (src / 'constellation.json').read_text(encoding='utf-8').strip()

body = body.replace('__LOGO_PATHS__', logo)
js = js.replace('__CONSTELLATION__', cons)

assert '__LOGO_PATHS__' not in body and '__CONSTELLATION__' not in js, 'placeholder left behind'

fragment = f"{head}\n{body}\n<script>\n{js}\n</script>\n"
(dist / 'artifact.html').write_text(fragment, encoding='utf-8')

standalone = f"""<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#070A10">
<meta name="description" content="A New Constellation Begins — an evening at Jayasom, AMAALA. Sunday 13 September.">
<meta property="og:title" content="Jayasom · AMAALA">
<meta property="og:description" content="A New Constellation Begins — كوكبة جديدة تبدأ بالتألّق">
<meta property="og:type" content="website">
{head}
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
"""
(dist / 'index.html').write_text(standalone, encoding='utf-8')

for f in ('artifact.html', 'index.html'):
    print(f'{f:16} {len((dist/f).read_bytes()):>8,} bytes')
