const fs = require('fs');
const file = 'src/components/dashboard/SavedStashesReviewHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement1 = `  const { savedStashes, completeStashReview } = useCourseStore()
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})
  const [activeSubTab, setActiveSubTab] = useState<'leitner' | 'stashes'>('leitner')

  // Leitner state
  const [leitnerCards, setLeitnerCards] = useState<any[]>([])

  React.useEffect(() => {
    const loadLeitner = () => {
      try {
        const stored = localStorage.getItem('english-app-leitner-cards')
        if (stored) {
          setLeitnerCards(JSON.parse(stored))
        } else {
          // Pre-seed 4 words
          const seed = [
            { id: 'l1', wordEn: 'Birthday', translationFa: 'تولد', stage: 1, nextReviewAt: 0 },
            { id: 'l2', wordEn: 'Fight', translationFa: 'دعوا', stage: 1, nextReviewAt: 0 },
            { id: 'l3', wordEn: 'Party', translationFa: 'مهمانی', stage: 1, nextReviewAt: 0 },
            { id: 'l4', wordEn: 'Gift', translationFa: 'هدیه', stage: 1, nextReviewAt: 0 }
          ]
          setLeitnerCards(seed)
          localStorage.setItem('english-app-leitner-cards', JSON.stringify(seed))
        }
      } catch(e) {}
    }
    loadLeitner()
    window.addEventListener('leitner-updated', loadLeitner)
    return () => window.removeEventListener('leitner-updated', loadLeitner)
  }, [])

  const handleLeitnerReview = (id: string, success: boolean) => {
    setLeitnerCards(prev => {
      const next = prev.map(c => {
        if (c.id === id) {
          let stage = c.stage
          if (success) {
            stage = Math.min(5, stage + 1)
          } else {
            stage = 1
          }
          return { ...c, stage, nextReviewAt: Date.now() + 1000 * 60 * 60 * 24 * stage }
        }
        return c
      })
      localStorage.setItem('english-app-leitner-cards', JSON.stringify(next))
      window.dispatchEvent(new Event('leitner-updated'))
      return next
    })
  }

  const renderLeitnerBoxes = () => {
    const boxCounts = [1,2,3,4,5].map(stage => leitnerCards.filter(c => c.stage === stage).length)
    const boxNames = ['روزانه', '۳ روز', 'هفتگی', 'دوهفته‌ای', 'تثبیت‌شده']
    return (
      <div className="flex gap-2 w-full overflow-x-auto pb-2 no-scrollbar mt-4 mb-6">
        {[1,2,3,4,5].map(stage => (
          <div key={stage} className="flex-1 min-w-[80px] bg-secondary/50 rounded-xl p-3 flex flex-col items-center justify-center border border-border">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap mb-1">خانه {stage}</span>
            <span className="text-xl font-bold">{boxCounts[stage-1]}</span>
            <span className="text-[10px] text-muted-foreground">{boxNames[stage-1]}</span>
          </div>
        ))}
      </div>
    )
  }`;

content = content.replace(
  `  const { savedStashes, completeStashReview } = useCourseStore()\n  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})`,
  replacement1
);


// We will completely replace the return statement manually using regex
const returnBodyStart = content.indexOf('return (');
const returnBodyEnd = content.lastIndexOf(')\n}');

const newReturnBody = `return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      <div className="pb-1 mb-4">
        <h2 className="text-xl font-black relative inline-block mb-4">
          مرور با دایی‌جان
          <span className="absolute bottom-1 left-0 w-full h-2.5 bg-amber-300/60 -z-10 rounded-sm"></span>
        </h2>
        <div className="flex bg-secondary/50 p-1 rounded-xl w-full">
          <button
            onClick={() => setActiveSubTab('leitner')}
            className={\`flex-1 text-sm font-bold py-2 rounded-lg transition-colors \${activeSubTab === 'leitner' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}\`}
          >
            جعبه لایتنر ۵ مرحله‌ای (کلمات استوری)
          </button>
          <button
            onClick={() => setActiveSubTab('stashes')}
            className={\`flex-1 text-sm font-bold py-2 rounded-lg transition-colors \${activeSubTab === 'stashes' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}\`}
          >
            خلاصه درس‌ها (Saved Stashes)
          </button>
        </div>
      </div>

      {activeSubTab === 'leitner' && (
        <div className="w-full">
          {renderLeitnerBoxes()}
          <div className="space-y-3 mt-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
               مرور امروز (لایتنر)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {leitnerCards.filter(c => c.nextReviewAt <= now).map(card => {
                 const isFlipped = flippedCards[\`leitner-\${card.id}\`]
                 return (
                   <div key={card.id} className="relative w-full perspective-1000 h-[250px]" style={{ perspective: '1000px' }}>
                     <motion.div
                        className="w-full h-full relative preserve-3d"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Front of Card */}
                        <div
                          className="absolute inset-0 backface-hidden bg-card border-2 border-border shadow-sm rounded-2xl p-5 flex flex-col justify-between cursor-pointer"
                          onClick={() => toggleFlip(\`leitner-\${card.id}\`)}
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        >
                          <div>
                             <Badge variant="destructive">مرحله {card.stage}</Badge>
                             <h3 className="font-bold text-3xl leading-tight mt-6 text-center" dir="ltr">{card.wordEn}</h3>
                          </div>
                          <div className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
                            <RotateCcw className="w-3 h-3" /> برای چرخش ضربه بزنید
                          </div>
                        </div>

                        {/* Back of Card */}
                        <div
                          className="absolute inset-0 backface-hidden bg-primary/5 border-2 border-primary/20 shadow-sm rounded-2xl p-5 flex flex-col justify-between"
                          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                             <button
                               onClick={(e) => { e.stopPropagation(); playTTS(card.wordEn); }}
                               className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary/20"
                             >
                               <Volume2 className="w-6 h-6" />
                             </button>
                             <h4 className="font-bold text-2xl text-center">{card.translationFa}</h4>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLeitnerReview(card.id, false); toggleFlip(\`leitner-\${card.id}\`); }}
                              className="flex-1 bg-destructive/10 text-destructive text-xs font-bold py-2 rounded-xl border border-destructive/20 shadow-sm leading-tight"
                            >
                              نیاز به تکرار (بازگشت به خانه ۱ 🔄)
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLeitnerReview(card.id, true); toggleFlip(\`leitner-\${card.id}\`); }}
                              className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-xl shadow-sm leading-tight hover:opacity-90"
                            >
                              بلد بودم (ارتقا به خانه بعدی ✨)
                            </button>
                          </div>
                        </div>
                     </motion.div>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'stashes' && (
        <div className="w-full space-y-6">
          {displayDue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="bg-destructive w-2 h-2 rounded-full animate-pulse" />
                مرور امروز ({displayDue.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayDue.map(stash => renderStashCard(stash, true))}
              </div>
            </div>
          )}

          {displayRemembered.length > 0 && (
            <div className="space-y-3 mt-4">
              <h3 className="text-lg font-bold text-muted-foreground">
                یادگرفته‌شده‌ها ({displayRemembered.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayRemembered.map(stash => renderStashCard(stash, false))}
              </div>
            </div>
          )}

          {savedStashes.length === 0 && (
            <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl text-center">
              شما هنوز هیچ درسی را ذخیره نکرده‌اید. این فلش‌کارت‌ها به صورت نمونه نمایش داده شده‌اند.
            </div>
          )}
        </div>
      )}
    </div>
  )`;

const newContent = content.substring(0, returnBodyStart) + newReturnBody + '\n' + content.substring(returnBodyEnd + 1);

fs.writeFileSync(file, newContent);
