import { motion } from "framer-motion"

/** Lightweight animated mock of the app dashboard — pure presentation, no real data. */
export function DashboardPreview() {
  const bars = [42, 68, 55, 80, 61, 90, 73]

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      {/* window chrome */}
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-slate-500">
          arbxscan · live opportunities
        </span>
      </div>

      {/* stat row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {["Spread", "Confidence", "Liquidity"].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i }}
            className="rounded-lg border border-white/5 bg-white/5 p-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-lg font-bold text-cyan-300">
              {["+2.4%", "94", "$1.2M"][i]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* animated bar chart */}
      <div className="flex h-32 items-end justify-between gap-2 rounded-lg border border-white/5 bg-slate-950/50 p-4">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="w-full rounded-t bg-gradient-to-t from-cyan-500/40 to-cyan-300"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.1 * i,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* floating live pill */}
      <motion.div
        className="absolute -right-3 -top-3 rounded-full border border-cyan-400/30 bg-slate-900 px-3 py-1 text-xs font-medium text-cyan-300 shadow-lg"
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
      >
        ● Live scanning
      </motion.div>
    </div>
  )
}
