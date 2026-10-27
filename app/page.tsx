import BrainViewer from '../components/BrainViewer';

export default function Home() {
  return (
    <main
      className="relative flex flex-col w-screen h-screen overflow-hidden bg-[#060913] text-white"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#060913',
        color: '#ffffff',
      }}
    >
      {/* Top Header Bar */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#060913]/70 backdrop-blur-md"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
          backgroundColor: 'rgba(6, 9, 19, 0.85)',
          backdropFilter: 'blur(12px)',
          height: '64px',
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 font-mono text-sm shadow-lg shadow-cyan-500/20"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#020617',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          >
            BW
          </div>
          <div>
            <h1
              className="text-sm font-semibold tracking-tight text-white font-mono"
              style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace', margin: 0 }}
            >
              Brainweb Diagnostic Console
            </h1>
            <p
              className="text-[11px] text-slate-400 font-mono"
              style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', margin: 0 }}
            >
              Procedural Judgment Engine & 7-Agent Gate Suite
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-4 text-xs font-mono"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontFamily: 'monospace' }}
        >
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              color: '#cbd5e1',
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}
            />
            <span>Satellite Status: Linked</span>
          </div>
          <div
            className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-medium"
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(8, 51, 68, 0.6)',
              border: '1px solid rgba(21, 94, 117, 0.6)',
              color: '#67e8f9',
            }}
          >
            3D WebGL Matrix Active
          </div>
        </div>
      </header>

      {/* Main 3D Brain Viewer Stage */}
      <section
        className="relative flex-1 w-full h-full overflow-hidden"
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        <BrainViewer />
      </section>
    </main>
  );
}
