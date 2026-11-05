import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ToggleTableBlock as ToggleTableBlockType } from "@/types"
import { BlockLearnerState } from "@/types/lesson"
import { ChevronDown, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Variants } from "framer-motion"

interface ToggleTableBlockProps {
  block: ToggleTableBlockType
  state?: BlockLearnerState
}

export function ToggleTableBlock({ block }: ToggleTableBlockProps) {
  const [openItemIndices, setOpenItemIndices] = React.useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItemIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full h-full flex flex-col justify-center px-6 py-12 bg-transparent gap-6"
    >
      {block.items && block.items.length > 0 && (
        <div className="flex flex-col gap-px bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
          {block.items.map((item, index) => {
            const isOpen = openItemIndices.includes(index)
            return (
              <div key={index} className="bg-card">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <span className="font-semibold font-sans text-foreground">{item.title}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-muted-foreground mt-2 mb-4 leading-relaxed">{item.body}</p>

                        {item.examples && item.examples.length > 0 && (
                          <div className="flex flex-col gap-3">
                            {item.examples.map((ex, i) => (
                              <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 rounded-md bg-slate-50 dark:bg-slate-900">
                                <div className="flex-1 flex items-start justify-between gap-2">
                                  <span dir="ltr" className="font-serif text-slate-800 dark:text-slate-200 text-left">&quot;{ex.en}&quot;</span>
                                  <button
                                    onClick={() => handleSpeak(ex.en)}
                                    className="shrink-0 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div dir="rtl" className="flex-1 text-right text-slate-600 dark:text-slate-400 font-vazirmatn text-sm sm:pt-1">
                                  {ex.fa}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {block.table && block.table.headers.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                {block.table.headers.map((header, i) => (
                  <th key={i} className="px-6 py-3 font-medium tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 w-10"></th> {/* Action column for audio */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {block.table.rows.map((row, rowIndex) => {
                // Heuristic: Assume the column containing English text is usually the second one (index 1) for pronunciation.
                // In a robust app, you might have metadata specifying which column is English, but we'll try to find a phrase.
                const englishPhrase = row.find(cell => /^[a-zA-Z\s\.,\?!'"]+$/.test(cell)) || row[1] || row[0];

                return (
                  <tr key={rowIndex} className="bg-background hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={cn(
                          "px-6 py-4 whitespace-nowrap text-foreground",
                          cellIndex === 1 && "font-serif text-slate-800 dark:text-slate-200" // Highlight english phrase slightly
                        )}
                        dir={cellIndex === 1 ? 'ltr' : 'auto'} // Keep English LTR
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleSpeak(englishPhrase)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-primary"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </motion.div>
  )
}
