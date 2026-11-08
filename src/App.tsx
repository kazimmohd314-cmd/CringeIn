import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mode } from './types';

// Marquee text for the scrolling strip
const MARQUEE_TEXT =
  "THRILLED TO ANNOUNCE ★ HUMBLED & HONORED ★ MY JOURNEY ★ AGREE? ★ GRATEFUL ★ 10X MINDSET ★ SYNERGY ★ ALPHA GRIND ★ DISRUPTING ★ COLD PLUNGE ★ SIMON SINEK QUOTE ★ REACHING OUT ★ THOUGHT LEADER ★ ";

interface TapHeart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('to-linkedin');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [displayedOutput, setDisplayedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSquishing, setIsSquishing] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('Copy');
  const [reactionCount, setReactionCount] = useState<number>(0);
  const [targetReactions, setTargetReactions] = useState<number>(1284);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [tapHearts, setTapHearts] = useState<TapHeart[]>([]);

  // Easter Egg State: OpenToWork 5-tap trigger within 3 seconds
  const [isOpenToWorkActive, setIsOpenToWorkActive] = useState<boolean>(false);
  const tapTimestampsRef = useRef<number[]>([]);
  const easterEggTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle Easter Egg: 5 taps within 3 seconds
  const handleWordmarkTap = () => {
    const now = Date.now();
    // Keep only taps within the last 3000ms
    tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t <= 3000);
    tapTimestampsRef.current.push(now);

    if (tapTimestampsRef.current.length >= 5) {
      tapTimestampsRef.current = [];
      setIsOpenToWorkActive(true);

      // Trigger specific vibration pattern: [30, 40, 30]
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 40, 30]);
      }

      // Lasts exactly 2 seconds, then smoothly returns to normal
      if (easterEggTimeoutRef.current) clearTimeout(easterEggTimeoutRef.current);
      easterEggTimeoutRef.current = setTimeout(() => {
        setIsOpenToWorkActive(false);
      }, 2000);
    }
  };

  // Typewriter effect for output: runs in ~1 second total
  useEffect(() => {
    if (!output) {
      setDisplayedOutput('');
      return;
    }

    // Trigger haptic on output arrival
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    if (prefersReducedMotion) {
      setDisplayedOutput(output);
      setReactionCount(targetReactions);
      return;
    }

    setDisplayedOutput('');
    const totalDurationMs = 900;
    const stepTimeMs = 18;
    const totalSteps = Math.floor(totalDurationMs / stepTimeMs);
    const charsPerStep = Math.max(1, Math.ceil(output.length / totalSteps));

    let currentIdx = 0;
    const timer = setInterval(() => {
      currentIdx = Math.min(output.length, currentIdx + charsPerStep);
      setDisplayedOutput(output.slice(0, currentIdx));

      if (currentIdx >= output.length) {
        clearInterval(timer);
      }
    }, stepTimeMs);

    // Number ticker for reaction count (from 0 to targetReactions)
    let currentReactions = 0;
    const reactionStep = Math.ceil(targetReactions / 35);
    const reactionTimer = setInterval(() => {
      currentReactions = Math.min(targetReactions, currentReactions + reactionStep);
      setReactionCount(currentReactions);
      if (currentReactions >= targetReactions) {
        clearInterval(reactionTimer);
      }
    }, 25);

    return () => {
      clearInterval(timer);
      clearInterval(reactionTimer);
    };
  }, [output, targetReactions, prefersReducedMotion]);

  const handleTranslate = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setErrorMsg('Kuch likh toh pehle');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    if (isLoading) return;

    // Button squish animation & haptic
    setIsSquishing(true);
    setTimeout(() => setIsSquishing(false), 200);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    setIsLoading(true);
    setErrorMsg('');
    setOutput('');

    // Generate random reactions count between 820 and 4,950
    const randReactions = Math.floor(820 + Math.random() * 4130);
    setTargetReactions(randReactions);
    setReactionCount(0);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, mode }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(data.error || 'Thoda ruk ke try karo.');
        return;
      }

      if (data.result) {
        setOutput(data.result);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg('Thoda ruk ke try karo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopiedText('Copied. Go post it, coward.');
    setTimeout(() => {
      setCopiedText('Copy');
    }, 1800);
  };

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    const emojis = isLinkedInMode ? ['👍', '💡', '❤️', '🚀'] : ['💀', '👀', '🎯', '🔥'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    setTapHearts((prev) => [...prev.slice(-6), { id, x, y, emoji }]);
    setTimeout(() => {
      setTapHearts((prev) => prev.filter((h) => h.id !== id));
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  const isLinkedInMode = mode === 'to-linkedin';

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-start overflow-x-hidden transition-colors duration-500">
      {/* 1. Subtle Film Grain Overlay (4% opacity) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] bg-grain"
        aria-hidden="true"
      />

      {/* 2. Soft Radial Tint behind input (Cross-fades between blue, acid lime, or Easter Egg OpenToWork green) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: isOpenToWorkActive
            ? 'radial-gradient(ellipse 100% 70% at 50% 30%, rgba(5, 118, 66, 0.45) 0%, rgba(112, 181, 161, 0.18) 50%, transparent 80%)'
            : isLinkedInMode
            ? 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(10, 102, 194, 0.16) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(200, 255, 61, 0.13) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Easter Egg Full-Screen Background Tint Overlay (#057642 to #70B5A1) */}
      <AnimatePresence>
        {isOpenToWorkActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-0 z-0 bg-[#057642]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Single centered column (mobile first 360px-390px, max 480px on desktop) */}
      <main className="relative z-10 w-full max-w-[480px] px-4 pt-6 pb-12 flex flex-col gap-4">
        {/* Top: Header Wordmark */}
        <header className="flex flex-col gap-1.5 select-none relative">
          {/* Easter Egg #OPENTOWORK Arc / Ribbon Banner */}
          <AnimatePresence>
            {isOpenToWorkActive && (
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { y: -18, opacity: 0, scale: 0.95 }
                }
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-7 left-0 right-0 flex items-center justify-center pointer-events-none z-30"
              >
                <div className="relative px-3.5 py-1 bg-[#057642] text-white rounded-full border-2 border-[#70B5A1] shadow-lg flex items-center gap-1.5 overflow-hidden">
                  {/* Subtle shine on banner */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  <span className="w-2 h-2 rounded-full bg-[#70B5A1] animate-ping" />
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-[#F2F0E8] leading-none">
                    #OPENTOWORK
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center">
            {/* Wordmark: "CringeIn" with 5-tap Easter Egg listener */}
            <motion.div
              onClick={handleWordmarkTap}
              animate={
                isOpenToWorkActive && !prefersReducedMotion
                  ? { rotate: [0, -4, 4, -4, 4, 0] }
                  : { rotate: 0 }
              }
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="inline-block cursor-pointer select-none"
              style={{
                touchAction: 'manipulation',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
              title=""
            >
              <h1 className="font-display font-extrabold text-[44px] sm:text-[56px] tracking-tighter leading-none text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#141414] flex items-center">
                {'Cringe'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: -24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 22,
                      delay: prefersReducedMotion ? 0 : i * 0.04,
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}

                {/* The "In" sits in a small blue rounded box, rotated 3 degrees */}
                <motion.span
                  initial={{ scale: 0, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 3, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 18,
                    delay: prefersReducedMotion ? 0 : 0.28,
                  }}
                  className="ml-0.5 inline-flex items-center justify-center bg-[#0A66C2] text-white px-2 py-0.5 rounded-[9px] text-[32px] sm:text-[42px] leading-none shadow-sm"
                >
                  In
                </motion.span>
              </h1>
            </motion.div>
          </div>

          {/* Subline that changes with mode */}
          <div className="min-h-[20px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="text-sm font-sans text-[#8A8A88] dark:text-[#8A8A88] light:text-[#666] tracking-tight"
              >
                {isLinkedInMode
                  ? "Say it normally. We'll make it LinkedIn."
                  : "Paste the post. We'll tell you what it means."}
              </motion.p>
            </AnimatePresence>
          </div>
        </header>

        {/* Marquee Strip: LinkedIn Cliches */}
        <div
          className="w-full overflow-hidden whitespace-nowrap border-y border-[#262626] dark:border-[#262626] light:border-[#E5E5E0] py-1 text-[10px] font-mono tracking-widest text-[#70706C] select-none"
          aria-hidden="true"
        >
          <div className="animate-marquee">
            <span>{MARQUEE_TEXT}</span>
            <span>{MARQUEE_TEXT}</span>
          </div>
        </div>

        {/* Chunky Mode Toggle with Sliding Highlight */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#181818] dark:bg-[#181818] light:bg-[#EAEAE6] rounded-xl border-2 border-[#2E2E2E] dark:border-[#2E2E2E] light:border-[#D0D0CA] relative select-none">
          {/* To LinkedIn Button */}
          <button
            type="button"
            onClick={() => {
              if (mode !== 'to-linkedin') {
                setMode('to-linkedin');
                setOutput('');
                setErrorMsg('');
              }
            }}
            className={`relative z-10 h-11 rounded-lg text-sm font-display font-extrabold transition-colors flex items-center justify-center border-2 border-transparent ${
              isLinkedInMode ? 'text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            To LinkedIn
            {isLinkedInMode && (
              <motion.div
                layoutId="toggle-active-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="absolute inset-0 bg-[#0A66C2] rounded-lg -z-10 shadow-sm border-2 border-[#0A66C2]"
              />
            )}
          </button>

          {/* To Real Button */}
          <button
            type="button"
            onClick={() => {
              if (mode !== 'to-real') {
                setMode('to-real');
                setOutput('');
                setErrorMsg('');
              }
            }}
            className={`relative z-10 h-11 rounded-lg text-sm font-display font-extrabold transition-colors flex items-center justify-center border-2 border-transparent ${
              !isLinkedInMode ? 'text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            To Real
            {!isLinkedInMode && (
              <motion.div
                layoutId="toggle-active-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="absolute inset-0 bg-[#C8FF3D] rounded-lg -z-10 shadow-sm border-2 border-[#C8FF3D]"
              />
            )}
          </button>
        </div>

        {/* Middle: Text Input */}
        <div className="w-full relative">
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLinkedInMode
                ? 'Aaj maine ek app banayi...'
                : 'Paste a LinkedIn post here...'
            }
            className="w-full bg-[#161616] dark:bg-[#161616] light:bg-white border-2 border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#D8D8D2] rounded-xl p-3.5 text-base text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] placeholder:text-[#666] focus:outline-none focus:border-[#0A66C2] dark:focus:border-[#0A66C2] resize-none leading-relaxed transition-colors shadow-soft-card"
          />
        </div>

        {/* Error / Validation Banner */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono font-bold text-[#FF5A5A] px-1"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Primary Action Button: 56px tall, hard offset shadow (collapses 4px on press) */}
        <motion.button
          type="button"
          disabled={isLoading}
          onClick={handleTranslate}
          animate={{ scale: isSquishing ? 0.95 : 1 }}
          transition={{ duration: 0.1 }}
          className={`w-full h-14 rounded-xl text-base font-display font-extrabold uppercase tracking-wide border-2 border-black dark:border-black flex items-center justify-center shadow-hard-dark dark:shadow-hard-dark light:shadow-hard-light btn-pressable ${
            isLinkedInMode
              ? 'bg-[#0A66C2] text-white hover:bg-linkedin-hover'
              : 'bg-[#C8FF3D] text-black hover:bg-acidlime-hover'
          } ${isLoading ? 'opacity-80' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </span>
              <span className="normal-case text-xs font-sans font-medium tracking-normal">
                Rahul is typing a humble post...
              </span>
            </span>
          ) : isLinkedInMode ? (
            'Make it LinkedIn'
          ) : (
            'What do they mean'
          )}
        </motion.button>

        {/* OUTPUT CARD: Swaps with a quick flip (rotateX) */}
        <AnimatePresence mode="wait">
          {output && (
            <motion.div
              key={mode}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: 25, y: 16 }
              }
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, rotateX: -25 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              onClick={handleCardTap}
              className="relative w-full cursor-pointer select-none"
            >
              {/* Tap Hearts Animation (purely decorative) */}
              {tapHearts.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ scale: 0, opacity: 1, y: 0 }}
                  animate={{ scale: 1.8, opacity: 0, y: -24 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-30 font-sans text-xl"
                  style={{ left: h.x, top: h.y }}
                >
                  {h.emoji}
                </motion.div>
              ))}

              {/* CARD VARIANT 1: TO LINKEDIN FEED POST */}
              {isLinkedInMode ? (
                <div className="w-full bg-[#161616] dark:bg-[#161616] light:bg-white border-2 border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#D8D8D2] rounded-xl p-4 shadow-soft-card flex flex-col gap-3">
                  {/* Fake Profile Header */}
                  <div className="flex items-start gap-2.5 pb-2 border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#EAEAEA]">
                    <div className="w-10 h-10 rounded-full bg-[#242424] dark:bg-[#242424] light:bg-[#EAEAE6] border border-[#3E3E3E] text-sm font-display font-bold flex items-center justify-center text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] shrink-0">
                      RS
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-bold text-sm text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111]">
                          Rahul S.
                        </span>
                        <span className="text-[11px] font-mono text-[#0A66C2] font-semibold">
                          • 1st
                        </span>
                      </div>
                      <span className="text-[11px] font-sans text-[#8A8A88] dark:text-[#8A8A88] light:text-[#666] truncate">
                        Founder @ Stealth | Ex-Unemployed | TedX Stalker
                      </span>
                      <span className="text-[10px] font-mono text-[#666] mt-0.5">
                        2h • 🌐
                      </span>
                    </div>
                  </div>

                  {/* Generated Post Content */}
                  <div className="text-sm sm:text-base font-sans text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] whitespace-pre-wrap leading-relaxed py-1">
                    {displayedOutput}
                  </div>

                  {/* Fake Reaction Counter (ticks up from 0) */}
                  <div className="pt-2 border-t border-[#262626] dark:border-[#262626] light:border-[#EAEAEA] flex items-center justify-between text-[11px] font-mono text-[#8A8A88]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5">
                        <span className="w-4 h-4 rounded-full bg-[#0A66C2] text-white text-[9px] flex items-center justify-center font-bold">
                          👍
                        </span>
                        <span className="w-4 h-4 rounded-full bg-[#C8FF3D] text-black text-[9px] flex items-center justify-center font-bold">
                          💡
                        </span>
                      </span>
                      <span className="font-bold text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111]">
                        {reactionCount.toLocaleString()} reactions
                      </span>
                    </div>
                    <span>42 comments</span>
                  </div>

                  {/* Fake Action Row: Like, Comment, Repost line icons */}
                  <div className="pt-2 border-t border-[#262626] dark:border-[#262626] light:border-[#EAEAEA] flex items-center justify-around text-xs font-sans text-[#8A8A88] pb-1">
                    <div className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      <span>Like</span>
                    </div>

                    <div className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Comment</span>
                    </div>

                    <div className="flex items-center gap-1.5 hover:text-[#0A66C2] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <polyline points="17 1 21 5 17 9" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <polyline points="7 23 3 19 7 15" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                      <span>Repost</span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="pt-2 border-t border-[#262626] dark:border-[#262626] light:border-[#EAEAEA] flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy();
                      }}
                      className="text-xs font-display font-bold px-3 py-1.5 rounded-lg bg-[#242424] dark:bg-[#242424] light:bg-[#EAEAEA] text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] hover:bg-[#0A66C2] hover:text-white transition-colors border border-[#3E3E3E]"
                    >
                      {copiedText}
                    </button>
                  </div>
                </div>
              ) : (
                /* CARD VARIANT 2: TO REAL STICKY NOTE IN ACID LIME */
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? {}
                      : { scale: 0.9, rotate: -4 }
                  }
                  animate={{ scale: 1, rotate: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="w-full bg-[#C8FF3D] text-[#0E0E0E] rounded-xl p-5 border-2 border-black shadow-hard-dark dark:shadow-hard-dark light:shadow-hard-light flex flex-col gap-3 relative"
                >
                  {/* Tape mark at top of sticky note */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 border border-black/20 -rotate-1 pointer-events-none" />

                  <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-black/60 pt-1">
                    ASLIYAT // WHAT THEY ACTUALLY MEAN:
                  </div>

                  {/* Handwriting text in Caveat font */}
                  <div className="font-handwriting font-bold text-2xl sm:text-3xl text-black leading-snug py-1">
                    "{displayedOutput}"
                  </div>

                  {/* Copy Button on Sticky Note */}
                  <div className="pt-2 border-t border-black/15 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy();
                      }}
                      className="text-xs font-display font-bold px-3 py-1.5 rounded-lg bg-black text-[#C8FF3D] hover:bg-black/90 transition-colors border border-black"
                    >
                      {copiedText}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
