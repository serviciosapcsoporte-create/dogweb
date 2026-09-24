import os, re, glob

root = os.path.dirname(os.path.abspath(__file__))
files = glob.glob(os.path.join(root, "**", "*.html"), recursive=True)
marker = "SW-REGISTER-DOGWEB"
reg_block = (
    "\n<script>\n/* " + marker + " */\n"
    "if ('serviceWorker' in navigator) {\n"
    "  window.addEventListener('load', function() {\n"
    "    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function(e) { console.warn('SW not registered', e); });\n"
    "  });\n"
    "}\n</script>"
)

changed = []
for fp in sorted(files):
    src = open(fp, encoding="utf-8").read()
    if marker in src:
        continue
    if "</body>" not in src:
        continue
    src = src.replace("</body>", reg_block + "\n</body>", 1)
    open(fp, "w", encoding="utf-8", newline="\n").write(src)
    changed.append(os.path.relpath(fp, root))

print("REGISTERED:", len(changed))