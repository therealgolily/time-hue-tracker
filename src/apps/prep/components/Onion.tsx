import { useRef, useState } from 'react';
import { Upload, Trash2, FileText, Download, Loader2 } from 'lucide-react';
import { usePrepFiles } from '../hooks/usePrepFiles';
import { formatBytes } from '../utils';

const Onion = ({ sessionId }: { sessionId: string }) => {
  const { files, uploadFile, deleteFile, getFileUrl } = usePrepFiles(sessionId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => uploadFile.mutate(file));
  };

  const handleOpen = async (filePath: string, fileName: string) => {
    try {
      const url = await getFileUrl(filePath);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (e) {
      console.error('Failed to get file URL', e);
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden shadow-lg"
      style={{ background: '#EDE0F5', border: '2px solid #CDB8DC' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #CDB8DC', background: '#E2D0EF' }}
      >
        <span className="text-lg">🧅</span>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4A1A6E' }}>
          References
        </h3>
        {uploadFile.isPending && (
          <Loader2 size={13} className="ml-auto animate-spin" style={{ color: '#7B3F9E' }} />
        )}
      </div>

      {/* Drop zone */}
      <div
        className="mx-3 mt-3 p-4 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 cursor-pointer transition-colors flex-shrink-0"
        style={{
          borderColor: isDragging ? '#7B3F9E' : '#CDB8DC',
          background: isDragging ? '#D8C0F0' : '#F5EDF8',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleUpload(e.dataTransfer.files);
        }}
      >
        <Upload size={18} style={{ color: '#7B3F9E' }} />
        <span className="text-xs text-center" style={{ color: '#7B3F9E' }}>
          Drop files or click to upload
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 mt-1">
        {files.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#9B6BB5' }}>
            No files yet
          </p>
        )}
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-2 p-2 rounded-lg group"
            style={{ background: '#F0E0FA', border: '1px solid #D8C0F0' }}
          >
            <FileText size={13} style={{ color: '#7B3F9E', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: '#3D1A5E' }}>
                {file.file_name}
              </div>
              {file.file_size != null && (
                <div className="text-xs" style={{ color: '#9B6BB5' }}>
                  {formatBytes(file.file_size)}
                </div>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => handleOpen(file.file_path, file.file_name)}
                className="p-1 rounded hover:bg-[#CDB8DC]"
                title="Download"
              >
                <Download size={11} style={{ color: '#7B3F9E' }} />
              </button>
              <button
                onClick={() => deleteFile.mutate(file)}
                className="p-1 rounded hover:bg-red-100"
                title="Delete"
              >
                <Trash2 size={11} style={{ color: '#C0392B' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Onion;
