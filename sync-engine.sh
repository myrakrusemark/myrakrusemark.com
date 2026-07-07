#!/usr/bin/env bash
# Promote the current singularity-ui engine into the site as a pinned
# vendor snapshot. Experimentation lives in ../singularity-ui (labs,
# demo pages, branches); the site only ever sees what this script copies.
#
# Usage: ./sync-engine.sh            # sync from engine master
#        ./sync-engine.sh <ref>      # sync from a specific branch/commit
set -euo pipefail

ENGINE="${ENGINE_DIR:-../singularity-ui}"
REF="${1:-master}"
DEST="vendor/singularity-ui"

cd "$(dirname "$0")"

if ! git -C "$ENGINE" diff --quiet -- src/ 2>/dev/null; then
  echo "warning: $ENGINE has uncommitted src/ changes; syncing committed state of '$REF' only" >&2
fi

rm -rf "$DEST"
mkdir -p "$DEST"
git -C "$ENGINE" archive "$REF" src | tar -x -C "$DEST" --strip-components=1

COMMIT=$(git -C "$ENGINE" rev-parse --short "$REF")
DATE=$(git -C "$ENGINE" show -s --format=%ci "$REF")
cat > "$DEST/VERSION" <<EOF
singularity-ui @ $COMMIT ($REF)
committed: $DATE
synced: $(date -Iseconds)
EOF

echo "Synced singularity-ui $REF ($COMMIT) -> $DEST"
