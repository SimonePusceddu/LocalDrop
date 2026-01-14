import httpBridge from 'react-native-http-bridge-refurbished';
import * as FileSystem from 'expo-file-system/legacy';
import { SharedFile } from './types';
import { getWebInterface } from './webInterface';

const PORT = 8080;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wav': 'audio/wav',
  '.zip': 'application/zip',
  '.txt': 'text/plain',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

function jsonResponse(
  requestId: string,
  data: unknown,
  statusCode: number = 200
): void {
  httpBridge.respond(
    requestId,
    statusCode,
    'application/json',
    JSON.stringify(data),
    corsHeaders()
  );
}

function htmlResponse(requestId: string, html: string): void {
  httpBridge.respond(requestId, 200, 'text/html', html, corsHeaders());
}

async function fileResponse(
  requestId: string,
  file: SharedFile
): Promise<void> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const headers = {
      ...corsHeaders(),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
    };

    httpBridge.respond(
      requestId,
      200,
      file.mimeType,
      fileContent,
      headers,
      true // isBase64
    );
  } catch (error) {
    jsonResponse(requestId, { success: false, error: 'File not found' }, 404);
  }
}

interface ServerCallbacks {
  getFiles: () => SharedFile[];
  addFile: (file: SharedFile) => void;
  removeFile: (id: string) => void;
  getIp: () => string | null;
}

export function startServer(callbacks: ServerCallbacks): void {
  httpBridge.start(PORT, 'LocalDrop', async (request) => {
    const { requestId, type: method, url, postData } = request;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      httpBridge.respond(requestId, 204, 'text/plain', '', corsHeaders());
      return;
    }

    // Parse URL path
    const urlPath = url.split('?')[0];

    try {
      // Route: GET / - Serve web interface
      if (method === 'GET' && urlPath === '/') {
        const ip = callbacks.getIp() || 'unknown';
        htmlResponse(requestId, getWebInterface(ip, PORT));
        return;
      }

      // Route: GET /api/status - Health check
      if (method === 'GET' && urlPath === '/api/status') {
        jsonResponse(requestId, {
          success: true,
          status: 'running',
          port: PORT,
          ip: callbacks.getIp(),
        });
        return;
      }

      // Route: GET /api/files - List files
      if (method === 'GET' && urlPath === '/api/files') {
        const files = callbacks.getFiles();
        jsonResponse(requestId, {
          success: true,
          files: files.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            mimeType: f.mimeType,
            downloadUrl: `/api/files/${encodeURIComponent(f.id)}`,
          })),
        });
        return;
      }

      // Route: GET /api/files/:id - Download file
      if (method === 'GET' && urlPath.startsWith('/api/files/')) {
        const fileId = decodeURIComponent(urlPath.replace('/api/files/', ''));
        const files = callbacks.getFiles();
        const file = files.find((f) => f.id === fileId);

        if (file) {
          await fileResponse(requestId, file);
        } else {
          jsonResponse(requestId, { success: false, error: 'File not found' }, 404);
        }
        return;
      }

      // Route: DELETE /api/files/:id - Remove file from list
      if (method === 'DELETE' && urlPath.startsWith('/api/files/')) {
        const fileId = decodeURIComponent(urlPath.replace('/api/files/', ''));
        callbacks.removeFile(fileId);
        jsonResponse(requestId, { success: true });
        return;
      }

      // Route: POST /api/upload - Upload file
      if (method === 'POST' && urlPath === '/api/upload') {
        if (!postData) {
          jsonResponse(requestId, { success: false, error: 'No data received' }, 400);
          return;
        }

        try {
          // Parse multipart form data
          const boundary = extractBoundary(request);
          if (!boundary) {
            jsonResponse(requestId, { success: false, error: 'Invalid content type' }, 400);
            return;
          }

          const parsed = parseMultipart(postData, boundary);
          if (!parsed) {
            jsonResponse(requestId, { success: false, error: 'Failed to parse upload' }, 400);
            return;
          }

          // Save file to document directory
          const fileName = parsed.filename || `upload_${Date.now()}`;
          const filePath = `${FileSystem.documentDirectory}${fileName}`;

          await FileSystem.writeAsStringAsync(filePath, parsed.data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Get file info
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          const fileSize = fileInfo.exists ? (fileInfo as { size: number }).size : 0;

          // Add to shared files
          const newFile: SharedFile = {
            id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            uri: filePath,
            size: fileSize,
            mimeType: parsed.mimeType || getMimeType(fileName),
            addedAt: Date.now(),
          };

          callbacks.addFile(newFile);
          jsonResponse(requestId, { success: true, file: newFile });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          jsonResponse(requestId, { success: false, error: 'Upload failed' }, 500);
        }
        return;
      }

      // 404 for unknown routes
      jsonResponse(requestId, { success: false, error: 'Not found' }, 404);
    } catch (error) {
      console.error('Server error:', error);
      jsonResponse(requestId, { success: false, error: 'Internal server error' }, 500);
    }
  });
}

export function stopServer(): void {
  httpBridge.stop();
}

function extractBoundary(request: { type: string; url: string; postData?: string }): string | null {
  // The boundary is typically in the content-type header
  // Since we don't have direct access to headers, we'll try to extract from postData
  if (!request.postData) return null;

  // Look for boundary in the data itself
  const match = request.postData.match(/------WebKitFormBoundary[\w]+/);
  if (match) {
    return match[0].substring(2); // Remove leading --
  }

  // Try standard boundary format
  const standardMatch = request.postData.match(/--([^\r\n]+)/);
  if (standardMatch) {
    return standardMatch[1];
  }

  return null;
}

interface ParsedMultipart {
  filename: string;
  mimeType: string;
  data: string;
}

function parseMultipart(data: string, boundary: string): ParsedMultipart | null {
  try {
    const parts = data.split(`--${boundary}`);

    for (const part of parts) {
      if (part.includes('filename=')) {
        // Extract filename
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const filename = filenameMatch ? filenameMatch[1] : 'unknown';

        // Extract content type
        const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
        const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

        // Extract data (after double newline)
        const dataStartIndex = part.indexOf('\r\n\r\n');
        if (dataStartIndex === -1) continue;

        let fileData = part.substring(dataStartIndex + 4);

        // Remove trailing boundary markers
        const endIndex = fileData.lastIndexOf('\r\n');
        if (endIndex !== -1) {
          fileData = fileData.substring(0, endIndex);
        }

        // Convert to base64 if not already
        // The browser sends binary data, we need to handle it
        const base64Data = btoa(
          fileData.split('').map(char =>
            String.fromCharCode(char.charCodeAt(0) & 0xff)
          ).join('')
        );

        return {
          filename,
          mimeType,
          data: base64Data,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Multipart parse error:', error);
    return null;
  }
}

export { PORT };
