export default function RefinementStation({ frames = [], step = 0, ts = 0, prev = null }) {

  const makeUrl = (rel) => rel ? `http://localhost:8000/static/${rel}?t=${ts}` : null

  // Current run selection
  const currStart = frames.length ? frames[0] : null
  const currMiddle = frames.length ? frames[Math.floor(frames.length / 2)] : null
  const currFinal = frames.length ? frames[frames.length - 1] : null

  const prevStart = prev ? prev.start : null
  const prevMiddle = prev ? prev.middle : null
  const prevFinal = prev ? prev.final : null

  const imgCard = (src, label) => (
    <div className="text-center">
      <div className="text-sm text-slate-300 mb-2">{label}</div>
      <div className="w-40 h-40 bg-black rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
        {src ? <img src={src} className="object-cover w-full h-full" alt={label} /> : <div className="text-slate-500 p-6">—</div>}
      </div>
    </div>
  )

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-semibold mb-2">Refinement Stage</h3>
      <p className="text-sm text-slate-400 mb-4">Compare start / middle / final of previous and current generations.</p>

      <div className="space-y-6">
        {/* Previous run */}
        <div>
          <div className="text-sm text-slate-300 mb-3">Previous Generation</div>
          <div className="flex gap-4 items-start">
            {imgCard(makeUrl(prevStart), 'Start')}
            {imgCard(makeUrl(prevMiddle), 'Middle')}
            {imgCard(makeUrl(prevFinal), 'Final')}
          </div>
        </div>

        {/* Current run */}
        <div>
          <div className="text-sm text-slate-300 mb-3">Current Generation</div>
          <div className="flex gap-4 items-start">
            {imgCard(makeUrl(currStart), 'Start')}
            {imgCard(makeUrl(currMiddle), 'Middle')}
            {imgCard(makeUrl(currFinal), 'Final')}
          </div>
        </div>
      </div>
    </div>
  )
}