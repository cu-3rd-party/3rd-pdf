import React, { useState, useRef } from 'react';
import { processPdfBytes } from '../lib/pdfDarkTheme';

export default function QuickConvert({ colorMap }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (file.type !== 'application/pdf') {
      alert('Пожалуйста, загрузите валидный PDF файл.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStats(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const result = await processPdfBytes(bytes, colorMap, 'invert', (current, total) => {
        setProgress(Math.round(((current + 1) / total) * 100));
      });

      setStats(result.stats);
      
      // Download the file
      const blob = new Blob([result.darkBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let newName = file.name;
      if (newName.toLowerCase().endsWith('.pdf')) {
        newName = newName.slice(0, -4) + '_dark.pdf';
      } else {
        newName = newName + '_dark.pdf';
      }
      a.download = newName;
      
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Ошибка обработки PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '40px' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Быстрая конвертация в тёмную тему</h2>
      
      <div 
        className={`dropzone ${loading ? 'active' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current.click()}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleChange}
        />
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '16px', fontWeight: '500' }}>Обработка PDF... {progress}%</p>
          </div>
        ) : (
          <>
            <div className="drop-icon">📄</div>
            <h3>Перетащите ваш PDF сюда</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>или нажмите, чтобы выбрать файл</p>
          </>
        )}
      </div>

        {stats && (
          <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius)' }}>
          <h3 style={{ marginBottom: '16px' }}>Конвертация успешно завершена!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.pages}</div>
              <div style={{ color: 'var(--text-muted)' }}>Страниц</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.replaced}</div>
              <div style={{ color: 'var(--text-muted)' }}>Цветов заменено</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{stats.kept}</div>
              <div style={{ color: 'var(--text-muted)' }}>Цветов сохранено</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
