"""Generate an entirely synthetic, reproducible 16-slice CT-like DICOM series.
No patient source data, names, dates of birth, or burned-in identifiers are used.
Requires pydicom==3.0.1. The pixels are geometric teaching art, not anatomy.
"""
from pathlib import Path
import math
import struct
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, CTImageStorage

STUDY_UID = '1.2.826.0.1.3680043.10.543.20261105.1'
SERIES_UID = '1.2.826.0.1.3680043.10.543.20261105.1.1'
OUT = Path(__file__).resolve().parents[1] / 'demo'
OUT.mkdir(exist_ok=True)
SIZE = 256
for z in range(16):
    sop_uid = f'{SERIES_UID}.{z+1}'
    meta = FileMetaDataset()
    meta.MediaStorageSOPClassUID = CTImageStorage
    meta.MediaStorageSOPInstanceUID = sop_uid
    meta.TransferSyntaxUID = ExplicitVRLittleEndian
    meta.ImplementationClassUID = '1.2.826.0.1.3680043.10.543.1'
    ds = FileDataset(str(OUT / f'slice-{z+1:02}.dcm'), {}, file_meta=meta, preamble=b'\0' * 128)
    ds.SOPClassUID = CTImageStorage
    ds.SOPInstanceUID = sop_uid
    ds.StudyInstanceUID = STUDY_UID
    ds.SeriesInstanceUID = SERIES_UID
    ds.PatientName = 'SYNTHETIC^EDUCATION'
    ds.PatientID = 'SYNTHETIC-NO-PATIENT'
    ds.PatientIdentityRemoved = 'YES'
    ds.DeidentificationMethod = 'Generated pixels; no source patient'
    ds.BurnedInAnnotation = 'NO'
    ds.StudyDate = '20261105'
    ds.SeriesDate = '20261105'
    ds.StudyTime = '120000'
    ds.Modality = 'CT'
    ds.StudyDescription = 'Synthetic axial orientation exercise'
    ds.SeriesDescription = 'Geometric CT-like teaching series'
    ds.SeriesNumber = 1
    ds.InstanceNumber = z + 1
    ds.ImageType = ['DERIVED', 'SECONDARY', 'SYNTHETIC']
    ds.Rows = SIZE
    ds.Columns = SIZE
    ds.PixelSpacing = [1.0, 1.0]
    ds.SliceThickness = 2.0
    ds.SpacingBetweenSlices = 2.0
    ds.ImageOrientationPatient = [1, 0, 0, 0, 1, 0]
    ds.ImagePositionPatient = [-128, -128, z * 2.0]
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = 'MONOCHROME2'
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 1
    ds.RescaleIntercept = -1024
    ds.RescaleSlope = 1
    ds.WindowCenter = 40
    ds.WindowWidth = 400
    pixels = []
    for y in range(SIZE):
        for x in range(SIZE):
            dx = (x - 128) / 105
            dy = (y - 128) / (110 - abs(z - 7.5) * 1.9)
            r = dx * dx + dy * dy
            value = -1000
            if r < 1.0:
                value = 38 + int(7 * math.sin(x / 11 + z / 3) * math.cos(y / 13))
            if 0.82 < r < 0.94:
                value = 750
            if abs(dx) < 0.11 and abs(dy) < 0.17 and 0.12 < r < 0.40:
                value = 4
            pixels.append(value + 1024)
    ds.PixelData = struct.pack('<' + 'h' * len(pixels), *pixels)
    ds.save_as(str(OUT / f'slice-{z+1:02}.dcm'), write_like_original=False)
print(f'Generated 16 synthetic DICOM slices in {OUT}')
