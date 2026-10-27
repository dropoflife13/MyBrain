import BrainViewer from '../components/BrainViewer';

export default function Home() {
  return (
    <main className="relative flex flex-col w-screen h-screen overflow-hidden bg-[#060913] text-white">
      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#060913]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 font-mono text-sm shadow-lg shadow-cyan-500/20">
            BW
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white font-mono">
              Brainweb Diagnostic Console
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Procedural Judgment Engine & 7-Agent Gate Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Satellite Status: Linked</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-medium">
            3D WebGL Matrix Active
          </div>
        </div>
      </header>

      {/* Main 3D Brain Viewer Stage */}
      <section className="relative flex-1 w-full h-full overflow-hidden">
        <BrainViewer />
      </section>
    </main>
  );
}
