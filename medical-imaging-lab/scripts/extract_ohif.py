"""Extract static OHIF files from pinned Docker image for local Node gateway fallback.
Docker must be able to pull/save images; starting containers is not required.
"""
from pathlib import Path
import json
import os
import shutil
import subprocess
import tarfile
import tempfile

IMAGE = 'ohif/app:v3.12.18'
out = Path(os.environ.get('OHIF_STATIC_DIR', '/tmp/gpa-ohif-html'))
out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='gpa-ohif-') as temp:
    archive = Path(temp) / 'image.tar'
    subprocess.run(['docker', 'pull', IMAGE], check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['docker', 'save', IMAGE, '-o', str(archive)], check=True)
    with tarfile.open(archive) as outer:
        manifest = json.load(outer.extractfile('manifest.json'))[0]
        for layer_name in manifest['Layers']:
            with tarfile.open(fileobj=outer.extractfile(layer_name), mode='r|*') as layer:
                for member in layer:
                    prefix = 'usr/share/nginx/html/'
                    if not member.isfile() or not member.name.startswith(prefix):
                        continue
                    relative = Path(member.name[len(prefix):])
                    if '..' in relative.parts:
                        continue
                    target = out / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with target.open('wb') as destination:
                        shutil.copyfileobj(layer.extractfile(member), destination)
print(f'OHIF static files ready in {out}')
