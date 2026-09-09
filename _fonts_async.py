import os, re, glob

root = os.path.dirname(os.path.abspath(__file__))
files = glob.glob(os.path.join(root, "**", "*.html"), recursive=True)

pat_old = re.compile(
    r'\s*<link rel="stylesheet" type="text/css" href="(https://fonts\.googleapis\.com/css2\?[^"]+)"\s*>'
)
marker = "FONTS-ASYNC-DOGWEB"

changed = []
for fp in sorted(files):
    src = open(fp, encoding="utf-8").read()
    if marker in src or not pat_old.search(src):
        continue
    href = pat_old.search(src).group(1)
    new_block = (
        f'\n<link rel="preload" as="style" href="{href}">\n'
        f'<link rel="stylesheet" href="{href}" media="print" onload="this.media=\'all\'"> <!-- {marker} -->\n'
        f'<noscript><link rel="stylesheet" href="{href}"></noscript>'
    )
    src = pat_old.sub(new_block, src, count=1)
    open(fp, "w", encoding="utf-8", newline="\n").write(src)
    changed.append(os.path.relpath(fp, root))

print(f"CHANGED {len(changed)} files")
for c in changed:
    print(" ", c)