/**
 * Google Drive REST API integration for automated SK PDF storage
 */

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  folderId?: string;
}

/**
 * Find or create dedicated folder in user's Google Drive
 */
export async function getOrCreateKgbFolder(
  accessToken: string,
  folderName: string = 'KGB - SK Kenaikan Gaji Berkala'
): Promise<string> {
  // 1. Search for existing folder
  const query = encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membuat folder di Google Drive');
  }

  const folder = await createRes.json();
  return folder.id;
}

/**
 * Upload PDF Blob to Google Drive using multipart upload
 */
export async function uploadPdfToDrive(
  blob: Blob,
  filename: string,
  accessToken: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const metadata: any = {
    name: filename,
    mimeType: 'application/pdf'
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataContentType = 'application/json; charset=UTF-8';
  const mediaContentType = 'application/pdf';

  // ArrayBuffer from blob
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const multipartHeader =
    `${delimiter}Content-Type: ${metadataContentType}\r\n\r\n` +
    JSON.stringify(metadata) +
    `${delimiter}Content-Type: ${mediaContentType}\r\n\r\n`;

  const headerBytes = new TextEncoder().encode(multipartHeader);
  const footerBytes = new TextEncoder().encode(closeDelimiter);

  // Combine header, binary file data, and footer
  const combined = new Uint8Array(headerBytes.length + bytes.length + footerBytes.length);
  combined.set(headerBytes, 0);
  combined.set(bytes, headerBytes.length);
  combined.set(footerBytes, headerBytes.length + bytes.length);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: combined
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengunggah file ke Google Drive');
  }

  const result = await uploadRes.json();
  return {
    fileId: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    folderId
  };
}
