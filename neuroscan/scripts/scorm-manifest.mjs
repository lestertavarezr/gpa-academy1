// imsmanifest.xml for a single-SCO SCORM 1.2 package.
const xml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function scormManifest({ identifier, version: pkgVersion, title }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xml(identifier)}" version="${xml(pkgVersion)}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="gpa-academy">
    <organization identifier="gpa-academy">
      <title>${xml(title)}</title>
      <item identifier="neuroscan-item" identifierref="neuroscan-sco" isvisible="true">
        <title>${xml(title)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="neuroscan-sco" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;
}
