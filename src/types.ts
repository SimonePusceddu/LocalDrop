export interface SharedFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  mimeType: string;
  addedAt: number;
}

export interface ServerStatus {
  running: boolean;
  port: number;
  ip: string | null;
  mdnsAdvertised: boolean;
}

export interface HttpRequest {
  requestId: string;
  type: string;
  url: string;
  postData?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FileListResponse {
  files: Array<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
    downloadUrl: string;
  }>;
}
