#!/usr/bin/env python3
"""Build and stage the standalone Jev article without publishing."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=Path('/data/Dropbox/Work/jev-vs-local/page'))
args = parser.parse_args()
source = args.source.resolve()
site = Path(__file__).resolve().parents[1]
for command in (
    ['python3', 'scripts/build-official-results.py', '--check'],
    ['python3', 'scripts/build-release.py'],
    ['python3', 'scripts/build-release.py', '--verify'],
):
    subprocess.run(command, cwd=source, check=True)
release = Path('/tmp/jev-article-release')
destination = site / 'write-ups/jev-vs-local'
staging = Path(tempfile.mkdtemp(prefix='jev-site-stage-')) / 'article'
shutil.copytree(release, staging)
for path in staging.rglob('*'):
    if not path.is_file() or path.suffix not in {'.html', '.css', '.js', '.json', '.md', '.svg'}:
        continue
    content = path.read_text()
    content = content.replace('/blog/jev-vs-local/', '/write-ups/jev-vs-local/')
    content = content.replace('https://myrakrusemark.com/watermark/', 'https://myrakrusemark.com/write-ups/watermark/')
    if path.name == 'index.html':
        breadcrumb = '<nav class="eyebrow breadcrumb" aria-label="Breadcrumb"><a href="/">MYRAKRUSEMARK.COM</a> <span aria-hidden="true">-</span> <a href="/write-ups/">WRITE-UPS</a> <span aria-hidden="true">-</span> <span aria-current="page">Jev ain\'t all that.</span></nav>'
        content, count = re.subn(r'<(?:nav|div) class="eyebrow[^"\n]*"[^>]*>.*?</(?:nav|div)>', lambda _: breadcrumb, content, count=1)
        if count != 1:
            raise RuntimeError('Source header changed; review breadcrumb integration before syncing.')
        content = re.sub(r'<a class="back"[^>]*>←[^<]*</a>', '', content)
        content = content.replace('</head>', '<link rel="stylesheet" href="/css/breadcrumb.css?v=20260923">\n</head>')
    path.write_text(content)
backup = Path(tempfile.mkdtemp(prefix='jev-site-backup-')) / 'article'
if destination.exists():
    shutil.move(str(destination), backup)
try:
    shutil.move(str(staging), destination)
except Exception:
    if backup.exists():
        shutil.move(str(backup), destination)
    raise
print(f'Staged {sum(p.is_file() for p in destination.rglob("*"))} public files at {destination}')
print(f'Previous website copy preserved at {backup}')
print('Standalone source unchanged. Nothing committed or published.')
