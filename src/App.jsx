import React, { useState } from 'react';
import QuickConvert from './components/QuickConvert';
import PreviewMode from './components/PreviewMode';
import { DEFAULT_COLOR_MAP } from './lib/pdfDarkTheme';

function App() {
  const [mode, setMode] = useState('home'); // 'home', 'quick', 'preview'
  const [globalColorMap, setGlobalColorMap] = useState(DEFAULT_COLOR_MAP);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-title" onClick={() => setMode('home')} style={{ cursor: 'pointer' }}>
          <img src="/logo.svg" alt="CU logo" width="32" height="32" style={{ objectFit: 'contain' }} />
          pdf editor
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={`btn ${mode === 'quick' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('quick')}>
            Конвертировать в темную тему
          </button>
          <button className={`btn ${mode === 'preview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('preview')}>
            Редактор палитры
          </button>
        </div>
      </header>

      <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {mode === 'home' && (
          <div className="glass-panel" style={{ padding: '48px', maxWidth: '600px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '2rem' }}>pdf.cu3rd.ru</h1>
            <p className="text-muted" style={{ marginBottom: '32px', fontSize: '1.05rem' }}>
              Это лишь альфа будущего сервиса cu-3rd-party, который позволит вносить изменения в официальные лонгриды Центрального Университета, а также создавать свои
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setMode('quick')} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Конвертировать PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('preview')} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                Открыть редактор
              </button>
            </div>
          </div>
        )}

        {mode === 'quick' && <QuickConvert colorMap={globalColorMap} />}

        {mode === 'preview' && <PreviewMode colorMap={globalColorMap} setColorMap={setGlobalColorMap} />}
      </main>
    </div>
  );
}

export default App;
