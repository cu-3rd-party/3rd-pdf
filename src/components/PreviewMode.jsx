import React, { useState, useEffect, useRef } from 'react';
import { processPdfBytes, DEFAULT_COLOR_MAP } from '../lib/pdfDarkTheme';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker path using local Vite asset
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PreviewMode({ colorMap, setColorMap }) {
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
  const [darkPdfBytes, setDarkPdfBytes] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const canvasOriginalRef = useRef(null);
  const canvasDarkRef = useRef(null);
  const fileInputRef = useRef(null);

  const pdfInputRef = useRef(null);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setOriginalPdfBytes(bytes);
      await processWithCurrentMap(bytes, colorMap);
    } catch (err) {
      alert('Ошибка при загрузке PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithCurrentMap = async (bytes, map) => {
    setIsProcessing(true);
    try {
      const result = await processPdfBytes(bytes, map, 'invert');
      setDarkPdfBytes(result.darkBytes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (originalPdfBytes && darkPdfBytes) {
      renderPage(originalPdfBytes, pageNumber, canvasOriginalRef.current);
      renderPage(darkPdfBytes, pageNumber, canvasDarkRef.current);
    }
  }, [originalPdfBytes, darkPdfBytes, pageNumber]);

  const renderPage = async (bytes, pageNum, canvas) => {
    if (!canvas) return;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      if (pageNum === 1) setTotalPages(pdf.numPages);
      
      const page = await pdf.getPage(pageNum);
      const containerWidth = canvas.parentElement.clientWidth - 10;
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const scale = containerWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };
      await page.render(renderContext).promise;
    } catch (e) {
      console.error("Render error:", e);
    }
  };

  const handleColorChange = (index, newHex) => {
    const newMap = [...colorMap];
    // Convert hex to rgb
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newHex);
    if (result) {
      newMap[index].dark = [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ];
      setColorMap(newMap);
      
      if (debounceTimer) clearTimeout(debounceTimer);
      setDebounceTimer(setTimeout(() => {
        if (originalPdfBytes) processWithCurrentMap(originalPdfBytes, newMap);
      }, 500));
    }
  };

  const exportPalette = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(colorMap, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "cu_dark_palette.json";
    a.click();
  };

  const importPalette = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        setColorMap(imported);
        if (originalPdfBytes) processWithCurrentMap(originalPdfBytes, imported);
      } catch (err) {
        alert("Неверный формат JSON файла");
      }
    };
    reader.readAsText(file);
  };

  const toHex = (rgb) => {
    return "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', gap: '24px' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px' }}>Редактор палитры</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={exportPalette}>
              Экспорт JSON
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => fileInputRef.current.click()}>
              Импорт JSON
            </button>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={importPalette} />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {colorMap.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: toHex(entry.light) }} title="Оригинальный цвет"></div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <input 
                type="color" 
                value={toHex(entry.dark)} 
                onChange={(e) => handleColorChange(idx, e.target.value)}
              />
              <span style={{ fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Предпросмотр документа</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isProcessing && <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Обработка изменений...</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ padding: '4px 12px' }} onClick={() => setPageNumber(p => Math.max(1, p - 1))}>←</button>
              <span>Стр. {pageNumber} / {totalPages || '?'}</span>
              <button className="btn btn-secondary" style={{ padding: '4px 12px' }} onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}>→</button>
            </div>
          </div>
        </div>

        {!originalPdfBytes ? (
          <div 
            className="dropzone" 
            style={{ flex: 1, margin: '20px 0' }}
            onClick={() => pdfInputRef.current?.click()}
          >
            <div className="drop-icon">📄</div>
            <h3>Загрузите PDF для предпросмотра</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Нажмите, чтобы выбрать файл</p>
            <input type="file" accept="application/pdf" style={{ display: 'none' }} ref={pdfInputRef} onChange={handlePdfUpload} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flex: 1, overflowY: 'auto' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-muted)' }}>Оригинал</h4>
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '8px', minHeight: '400px' }}>
                <canvas ref={canvasOriginalRef} style={{ width: '100%', height: 'auto', display: 'block' }}></canvas>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary)' }}>Тёмная тема</h4>
              <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '8px', minHeight: '400px' }}>
                <canvas ref={canvasDarkRef} style={{ width: '100%', height: 'auto', display: 'block' }}></canvas>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
