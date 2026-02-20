import { useRef, useState } from 'react';
import { X, Upload, FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { usePrepFiles } from '../../hooks/usePrepFiles';
import { formatBytes } from '../../utils';

interface Props { sessionId: string; onClose: () => void; }

const OnionModal = ({ sessionId, onClose }: Props) => {
  const { files, uploadFile, deleteFile, getFileUrl } = usePrepFiles(sessionId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((f) => uploadFile.mutate(f));
  };

  const handleOpen = async (path: string, name: string) => {
    try {
      const url = await getFileUrl(path);
      const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    } catch { /* silent */ }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(20,10,4,0.75)', backdropFilter: 'blur(6px)', zIndex: 50 }} onClick={onClose}>
      <div className="flex flex-col overflow-hidden animate-scale-in" style={{ width: 520, maxHeight: '80vh', background: '#EDE0F5', borderRadius: 20, border: '3px solid #CDB8DC', boxShadow: '0 30px 70px rgba(0,0,0,0.55)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: '#E2D0EF', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, borderBottom: '1px solid #CDB8DC' }}>
          <span style={{ fontSize: 20 }}>🧅</span>
          <span style={{ color: '#4A1A6E', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Reference Files</span>
          {uploadFile.isPending && <Loader2 size={14} className="ml-1 animate-spin" style={{ color: '#7B3F9E' }} />}
          <button onClick={onClose} style={{ marginLeft: 'auto', color: '#7B3F9E', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 16, flexShrink: 0 }}>
          <div
            style={{ border: `2px dashed ${isDragging ? '#7B3F9E' : '#CDB8DC'}`, background: isDragging ? '#D8C0F0' : '#F5EDF8', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
          >
            <Upload size={22} style={{ color: '#7B3F9E' }} />
            <span style={{ color: '#7B3F9E', fontSize: 12, textAlign: 'center' }}>Drop files here or click to upload</span>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {files.length === 0 && <p style={{ color: '#9B6BB5', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No files yet</p>}
          {files.map((file) => (
            <div key={file.id} className="group flex items-center gap-3" style={{ background: '#F0E0FA', border: '1px solid #D8C0F0', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <FileText size={14} style={{ color: '#7B3F9E', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#3D1A5E', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.file_name}</div>
                {file.file_size != null && <div style={{ color: '#9B6BB5', fontSize: 10 }}>{formatBytes(file.file_size)}</div>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpen(file.file_path, file.file_name)} style={{ padding: 4, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#7B3F9E' }}><Download size={13} /></button>
                <button onClick={() => deleteFile.mutate(file)} style={{ padding: 4, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', color: '#C0392B' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnionModal;
