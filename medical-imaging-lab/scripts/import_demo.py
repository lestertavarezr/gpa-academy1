"""Import generated demo DICOM into local Orthanc; requires only Python stdlib."""
from pathlib import Path
import base64
import os
import urllib.request

host = os.environ.get('ORTHANC_IMPORT_URL', 'http://127.0.0.1:8042').rstrip('/')
password = os.environ.get('ORTHANC_PASSWORD')
if not password:
    raise SystemExit('Set ORTHANC_PASSWORD to the value in .env')
root = Path(__file__).resolve().parents[1] / 'demo'
files = sorted(root.glob('*.dcm'))
if len(files) != 16:
    raise SystemExit('Expected 16 generated DICOM slices; run generate_demo.py')
auth = base64.b64encode(f'gpa:{password}'.encode()).decode()
for path in files:
    request = urllib.request.Request(host + '/instances', data=path.read_bytes(), method='POST', headers={
        'Content-Type': 'application/dicom', 'Authorization': 'Basic ' + auth,
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        if response.status not in (200, 201):
            raise SystemExit(f'Import failed: {path.name}: {response.status}')
print(f'Imported {len(files)} synthetic DICOM instances')
