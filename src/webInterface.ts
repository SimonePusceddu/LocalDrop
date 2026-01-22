export const getWebInterface = (serverIp: string, port: number): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocalDrop</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    header p {
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .status-bar {
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4ade80;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .card-header {
      background: #f8fafc;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header h2 {
      color: #1e293b;
      font-size: 1.25rem;
    }

    .card-body {
      padding: 20px;
    }

    .upload-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8fafc;
    }

    .upload-zone:hover, .upload-zone.dragover {
      border-color: #667eea;
      background: #f1f5f9;
    }

    .upload-zone.dragover {
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .upload-zone h3 {
      color: #475569;
      margin-bottom: 8px;
    }

    .upload-zone p {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .file-input {
      display: none;
    }

    .file-list {
      list-style: none;
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.2s;
    }

    .file-item:last-child {
      border-bottom: none;
    }

    .file-item:hover {
      background: #f8fafc;
    }

    .file-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      color: #1e293b;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-top: 2px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #94a3b8;
    }

    .empty-state p {
      margin-top: 10px;
    }

    .progress-bar {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 10px;
      display: none;
    }

    .progress-bar.active {
      display: block;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
      width: 0%;
    }

    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    .toast.error {
      background: #ef4444;
    }

    .toast.success {
      background: #22c55e;
    }

    @media (max-width: 600px) {
      header h1 {
        font-size: 1.8rem;
      }

      .file-item {
        flex-wrap: wrap;
        gap: 10px;
      }

      .file-item .btn {
        width: 100%;
        justify-content: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>LocalDrop</h1>
      <p>Share files between your phone and PC</p>
    </header>

    <div class="status-bar">
      <div class="status-dot"></div>
      <span>Connected to <strong>${serverIp}:${port}</strong></span>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Upload Files to Phone</h2>
      </div>
      <div class="card-body">
        <div class="upload-zone" id="uploadZone">
          <div class="upload-icon">&#128230;</div>
          <h3>Drop files here</h3>
          <p>or click to browse</p>
          <input type="file" class="file-input" id="fileInput" multiple>
        </div>
        <div class="progress-bar" id="uploadProgress">
          <div class="progress-fill" id="progressFill"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Files on Phone</h2>
      </div>
      <div class="card-body" id="fileListContainer">
        <div class="empty-state" id="emptyState">
          <div style="font-size: 3rem;">&#128193;</div>
          <p>No files shared yet</p>
        </div>
        <ul class="file-list" id="fileList"></ul>
      </div>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const API_BASE = '';

    function formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function getFileIcon(mimeType) {
      if (mimeType.startsWith('image/')) return '&#128247;';
      if (mimeType.startsWith('video/')) return '&#127909;';
      if (mimeType.startsWith('audio/')) return '&#127925;';
      if (mimeType.includes('pdf')) return '&#128196;';
      if (mimeType.includes('zip') || mimeType.includes('rar')) return '&#128230;';
      return '&#128196;';
    }

    function showToast(message, type = 'info') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast ' + type + ' show';
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    async function downloadFile(downloadUrl, filename) {
      try {
        showToast('Downloading...', 'info');
        const response = await fetch(API_BASE + downloadUrl);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Download failed');
        }

        // Use data URI directly - browser handles the decoding
        const a = document.createElement('a');
        a.href = data.dataUri;
        a.download = data.filename || filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('Download complete!', 'success');
      } catch (error) {
        showToast('Download failed: ' + error.message, 'error');
        console.error('Download error:', error);
      }
    }

    async function loadFiles() {
      try {
        const response = await fetch(API_BASE + '/api/files');
        const data = await response.json();

        const fileList = document.getElementById('fileList');
        const emptyState = document.getElementById('emptyState');

        if (data.files && data.files.length > 0) {
          emptyState.style.display = 'none';
          fileList.innerHTML = data.files.map(file => \`
            <li class="file-item">
              <div class="file-icon">\${getFileIcon(file.mimeType)}</div>
              <div class="file-info">
                <div class="file-name">\${file.name}</div>
                <div class="file-size">\${formatSize(file.size)}</div>
              </div>
              <button onclick="downloadFile('\${file.downloadUrl}', '\${file.name}')" class="btn btn-primary">
                &#11015; Download
              </button>
            </li>
          \`).join('');
        } else {
          emptyState.style.display = 'block';
          fileList.innerHTML = '';
        }
      } catch (error) {
        showToast('Failed to load files', 'error');
        console.error('Error loading files:', error);
      }
    }

    async function uploadFile(file) {
      const progressBar = document.getElementById('uploadProgress');
      const progressFill = document.getElementById('progressFill');
      progressBar.classList.add('active');
      progressFill.style.width = '0%';

      try {
        // Read file as base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 50; // First 50% is reading
              progressFill.style.width = percent + '%';
            }
          };
          reader.readAsDataURL(file);
        });

        progressFill.style.width = '50%';

        // Send as JSON
        const response = await fetch(API_BASE + '/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            data: base64Data,
          }),
        });

        progressFill.style.width = '100%';

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        showToast('File uploaded successfully!', 'success');
        loadFiles();
      } catch (error) {
        showToast('Upload failed: ' + error.message, 'error');
      } finally {
        setTimeout(() => {
          progressBar.classList.remove('active');
          progressFill.style.width = '0%';
        }, 1000);
      }
    }

    // Upload zone event handlers
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      for (const file of files) {
        uploadFile(file);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      for (const file of files) {
        uploadFile(file);
      }
      fileInput.value = '';
    });

    // Initial load
    loadFiles();

    // Refresh every 5 seconds
    setInterval(loadFiles, 5000);
  </script>
</body>
</html>
`;
