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
  const [isPostExpanded, setIsPostExpanded] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [tapHearts, setTapHearts] = useState<TapHeart[]>([]);

  // "To Real" Chat Parody State
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const [showRealReply, setShowRealReply] = useState<boolean>(false);
  const [areTicksLime, setAreTicksLime] = useState<boolean>(false);
  const [replyTimestamp, setReplyTimestamp] = useState<string>('');

  // Easter Egg State
  const [isOpenToWorkActive, setIsOpenToWorkActive] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(0);
  const [hasFoundEasterEgg, setHasFoundEasterEgg] = useState<boolean>(false);
  const tapTimestampsRef = useRef<number[]>([]);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const easterEggDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle Easter Egg: 5 taps within 3 seconds
  const handleWordmarkTap = () => {
    const now = Date.now();
    tapTimestampsRef.current = tapTimestampsRef.current.filter((t) => now - t <= 3000);
    tapTimestampsRef.current.push(now);

    const count = tapTimestampsRef.current.length;
    setTapCount(count);

    if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);
    tapResetTimerRef.current = setTimeout(() => {
      tapTimestampsRef.current = [];
      setTapCount(0);
    }, 3000);

    if (count >= 5) {
      if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);
      tapTimestampsRef.current = [];
      setIsOpenToWorkActive(true);
      setHasFoundEasterEgg(true);
      setTapCount(5);

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([30, 40, 30]);
      }

      if (easterEggDurationTimerRef.current) clearTimeout(easterEggDurationTimerRef.current);
      easterEggDurationTimerRef.current = setTimeout(() => {
        setIsOpenToWorkActive(false);
        setTapCount(0);
      }, 2000);
    }
  };

  const getHintText = () => {
    if (isOpenToWorkActive) return '#OPENTOWORK';
    if (tapCount > 0) return `${tapCount}/5`;
    if (hasFoundEasterEgg) return 'YOU FOUND IT';
    return 'TAP THE LOGO 5 TIMES';
  };

  // Chat message sequencing in "To Real" mode
  useEffect(() => {
    if (!output) {
      setIsChatTyping(false);
      setShowRealReply(false);
      setAreTicksLime(false);
      return;
    }

    if (mode === 'to-real') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setReplyTimestamp(nowTime);

      if (prefersReducedMotion) {
        setIsChatTyping(false);
        setShowRealReply(true);
        setAreTicksLime(true);
        setDisplayedOutput(output);
        return;
      }

      // Step 1: show typing for ~1 second
      setIsChatTyping(true);
      setShowRealReply(false);
      setAreTicksLime(false);

      const typingTimer = setTimeout(() => {
        setIsChatTyping(false);
        setShowRealReply(true);

        // Haptic when reply lands
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }

        // Two ticks turn lime after 1 second
        const ticksTimer = setTimeout(() => {
          setAreTicksLime(true);
        }, 1000);

        return () => clearTimeout(ticksTimer);
      }, 1000);

      return () => clearTimeout(typingTimer);
    }
  }, [output, mode, prefersReducedMotion]);

  // Typewriter effect for output text
  useEffect(() => {
    if (!output) {
      setDisplayedOutput('');
      setIsPostExpanded(false);
      setIsLiked(false);
      return;
    }

    setIsPostExpanded(false);
    setIsLiked(false);

    // In To LinkedIn mode: trigger haptic immediately
    if (mode === 'to-linkedin' && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    if (prefersReducedMotion) {
      setDisplayedOutput(output);
      setReactionCount(targetReactions);
      return;
    }

    // In To Real mode, wait until reply bubble is shown
    if (mode === 'to-real' && !showRealReply) {
      setDisplayedOutput('');
      return;
    }

    setDisplayedOutput('');
    const totalDurationMs = 800;
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

    // Reaction counter ticker in To LinkedIn mode
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
  }, [output, showRealReply, mode, targetReactions, prefersReducedMotion]);

  const handleTranslate = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setErrorMsg('Kuch likh toh pehle');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    if (isLoading) return;

    setIsSquishing(true);
    setTimeout(() => setIsSquishing(false), 200);

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    setIsLoading(true);
    setErrorMsg('');
    setOutput('');

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

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    if (!isLiked) {
      setReactionCount((prev) => prev + 1);
    } else {
      setReactionCount((prev) => Math.max(0, prev - 1));
    }
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(8);
    }
  };

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    const emojis = isLinkedInMode ? ['👍', '💡', '❤️', '👏'] : ['💀', '👀', '🎯', '🔥'];
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
  const isLongPost = (displayedOutput.match(/\n/g) || []).length >= 3 || displayedOutput.length > 180;

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-between overflow-x-hidden transition-colors duration-500">
      {/* 1. Subtle Film Grain Overlay (4% opacity) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] bg-grain"
        aria-hidden="true"
      />

      {/* 2. Soft Radial Tint behind input */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: isOpenToWorkActive
            ? 'radial-gradient(ellipse 100% 70% at 50% 30%, rgba(5, 118, 66, 0.45) 0%, rgba(112, 181, 161, 0.18) 50%, transparent 80%)'
            : isLinkedInMode
            ? 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(31, 95, 191, 0.16) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(200, 255, 61, 0.13) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Easter Egg Background Tint Overlay */}
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

      {/* Single centered column */}
      <main className="relative z-10 w-full max-w-[480px] px-4 pt-6 pb-6 flex flex-col gap-4">
        {/* Top: Header Wordmark */}
        <header className="flex flex-col gap-1 select-none relative">
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
            {/* Wordmark with 5-tap Easter Egg listener */}
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

                {/* Plain rounded square with text "In", rotated 3 degrees */}
                <motion.span
                  initial={{ scale: 0, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 3, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 18,
                    delay: prefersReducedMotion ? 0 : 0.28,
                  }}
                  className="ml-0.5 inline-flex items-center justify-center bg-[#1F5FBF] text-white px-2 py-0.5 rounded-[9px] text-[32px] sm:text-[42px] leading-none shadow-sm"
                >
                  In
                </motion.span>
              </h1>
            </motion.div>
          </div>

          {/* Easter Egg Hint Sticker Pill */}
          <div className="flex items-center pt-0.5 pb-1">
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 border border-dashed transition-all duration-200 select-none ${
                isOpenToWorkActive
                  ? 'border-[#70B5A1] bg-[#057642] text-white shadow-sm'
                  : tapCount > 0
                  ? 'border-[#C8FF3D] text-[#C8FF3D] bg-[#1E1E1E]'
                  : 'border-[#444] dark:border-[#444] light:border-[#AAA] text-[#888] dark:text-[#888] light:text-[#777] bg-[#141414]/60 dark:bg-[#141414]/60 light:bg-[#EFEFEA]/60'
              }`}
              style={{ transform: 'rotate(-2deg)' }}
            >
              <svg
                className="w-3 h-3 stroke-current fill-none shrink-0"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12" />
                <path d="M11 11.5a1.5 1.5 0 0 1 3 0V12" />
                <path d="M14 10.5a1.5 1.5 0 0 1 3 0V12" />
                <path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5.66-4L5 13.5a1.5 1.5 0 0 1 2.6-1.5L8 13" />
              </svg>
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase leading-none">
                {getHintText()}
              </span>
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
              isLinkedInMode ? 'text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            To LinkedIn
            {isLinkedInMode && (
              <motion.div
                layoutId="toggle-active-bg"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className="absolute inset-0 bg-[#1F5FBF] rounded-lg -z-10 shadow-sm border-2 border-[#1F5FBF]"
              />
            )}
          </button>

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
            className="w-full bg-[#161616] dark:bg-[#161616] light:bg-white border-2 border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#D8D8D2] rounded-xl p-3.5 text-base text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] placeholder:text-[#666] focus:outline-none focus:border-[#1F5FBF] dark:focus:border-[#1F5FBF] resize-none leading-relaxed transition-colors shadow-soft-card"
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

        {/* Primary Action Button */}
        <motion.button
          type="button"
          disabled={isLoading}
          onClick={handleTranslate}
          animate={{ scale: isSquishing ? 0.95 : 1 }}
          transition={{ duration: 0.1 }}
          className={`w-full h-14 rounded-xl text-base font-display font-extrabold uppercase tracking-wide border-2 border-black dark:border-black flex items-center justify-center shadow-hard-dark dark:shadow-hard-dark light:shadow-hard-light btn-pressable ${
            isLinkedInMode
              ? 'bg-[#1F5FBF] text-white hover:brightness-105'
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
                {isLinkedInMode
                  ? 'Rahul is typing a humble post...'
                  : 'Rahul Bhai is cooking a roast...'}
              </span>
            </span>
          ) : isLinkedInMode ? (
            'Make it LinkedIn'
          ) : (
            'What do they mean'
          )}
        </motion.button>

        {/* OUTPUT CARD CONTAINER */}
        <AnimatePresence mode="wait">
          {output && (
            <motion.div
              key={mode}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="w-full flex flex-col gap-3"
            >
              {/* TO LINKEDIN PARODY CARD */}
              {isLinkedInMode ? (
                <div
                  onClick={handleCardTap}
                  className="relative w-full bg-white dark:bg-[#1A1A1A] border border-[#E5E5E0] dark:border-[#2E2E2E] rounded-xl p-4 shadow-soft-card flex flex-col gap-3 select-none cursor-pointer"
                >
                  {/* Decorative Tap Hearts */}
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

                  {/* Header Row: Avatar, Name + "Verified Humble" Pill, Title, "2h" + Globe Icon */}
                  <div className="flex items-start gap-2.5 pb-2 border-b border-[#EAEAEA] dark:border-[#262626]">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FC] dark:bg-[#252525] border border-[#CBDFF5] dark:border-[#383838] text-sm font-display font-bold flex items-center justify-center text-[#1F5FBF] dark:text-[#70A5F5] shrink-0">
                      RS
                    </div>

                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-sans font-bold text-sm text-[#141414] dark:text-[#F2F0E8]">
                          Rahul Sharma
                        </span>

                        <span className="inline-flex items-center text-[10px] font-sans font-semibold text-[#1F5FBF] bg-[#1F5FBF]/10 dark:bg-[#1F5FBF]/20 border border-[#1F5FBF]/30 px-2 py-0.5 rounded-full leading-none">
                          Verified Humble
                        </span>
                      </div>

                      <span className="text-[11px] font-sans text-[#666] dark:text-[#8A8A88] truncate mt-0.5">
                        Thought Leader | Storyteller | Dad | Grateful
                      </span>

                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#888] dark:text-[#777] mt-0.5">
                        <span>2h</span>
                        <span>•</span>
                        <svg
                          className="w-3 h-3 stroke-current fill-none shrink-0"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Body: Generated post, with first 3 lines visible and "...more" smooth expand */}
                  <div className="py-1">
                    <motion.div
                      layout
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className={`text-sm sm:text-base font-sans text-[#141414] dark:text-[#F2F0E8] whitespace-pre-wrap leading-relaxed ${
                        !isPostExpanded && isLongPost ? 'line-clamp-3' : ''
                      }`}
                    >
                      {displayedOutput}
                    </motion.div>

                    {!isPostExpanded && isLongPost && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPostExpanded(true);
                        }}
                        className="text-xs font-sans font-bold text-[#1F5FBF] hover:underline mt-1 focus:outline-none"
                      >
                        ...more
                      </button>
                    )}
                  </div>

                  {/* Reaction Row */}
                  <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] flex items-center justify-between text-[11px] font-mono text-[#666] dark:text-[#8A8A88]">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center -space-x-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#1F5FBF] text-white flex items-center justify-center border border-white dark:border-[#1A1A1A]">
                          <svg
                            className="w-2.5 h-2.5 stroke-white fill-none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                          </svg>
                        </div>

                        <div className="w-4 h-4 rounded-full bg-[#E040FB] text-white flex items-center justify-center border border-white dark:border-[#1A1A1A]">
                          <svg
                            className="w-2.5 h-2.5 stroke-white fill-none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </div>

                        <div className="w-4 h-4 rounded-full bg-[#C8FF3D] text-black flex items-center justify-center border border-white dark:border-[#1A1A1A]">
                          <svg
                            className="w-2.5 h-2.5 stroke-black fill-none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 14l5-5 3 3-5 5z" />
                            <path d="M15 9l5-5-3-3-5 5z" />
                          </svg>
                        </div>
                      </div>

                      <span className="font-bold text-[#141414] dark:text-[#F2F0E8]">
                        {reactionCount.toLocaleString()}
                      </span>
                    </div>

                    <span>86 comments</span>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] grid grid-cols-4 text-xs font-sans text-[#666] dark:text-[#8A8A88]">
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className={`flex items-center justify-center gap-1.5 py-1 transition-colors ${
                        isLiked
                          ? 'text-[#1F5FBF] font-bold'
                          : 'hover:text-[#1F5FBF]'
                      }`}
                    >
                      <motion.svg
                        animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-4 h-4 stroke-current ${
                          isLiked ? 'fill-[#1F5FBF]' : 'fill-none'
                        }`}
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </motion.svg>
                      <span>Like</span>
                    </button>

                    <div className="flex items-center justify-center gap-1.5 py-1 hover:text-[#1F5FBF] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>Comment</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 py-1 hover:text-[#1F5FBF] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m17 2 4 4-4 4" />
                        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                        <path d="m7 22-4-4 4-4" />
                        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                      </svg>
                      <span>Repost</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 py-1 hover:text-[#1F5FBF] transition-colors">
                      <svg
                        className="w-4 h-4 stroke-current fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                      <span>Send</span>
                    </div>
                  </div>

                  {/* Faint Fake Comment Strip at Bottom */}
                  <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] flex items-center gap-2 text-[11px] font-sans text-[#888] dark:text-[#777] opacity-75">
                    <div className="w-5 h-5 rounded-full bg-[#DDD] dark:bg-[#333] flex items-center justify-center text-[9px] font-bold text-[#555] dark:text-[#AAA] shrink-0">
                      AP
                    </div>
                    <span className="truncate">
                      "Great insights! Thanks for sharing."
                    </span>
                  </div>
                </div>
              ) : (
                /* TO REAL MODE: PRIVATE CHAT PARODY CARD */
                <div className="relative w-full bg-[#181818] dark:bg-[#181818] light:bg-[#F2F2EE] border border-[#2E2E2E] dark:border-[#2E2E2E] light:border-[#D5D5CE] rounded-xl overflow-hidden shadow-soft-card flex flex-col select-none">
                  {/* Faint Doodle Pattern Background (4% opacity) */}
                  <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 12h10v6H8z'/%3E%3Ccircle cx='40' cy='15' r='5'/%3E%3Cpath d='M12 40l6-6 4 4'/%3E%3Cpath d='M35 42h8v8h-8z'/%3E%3Cpath d='M10 28h5'/%3E%3Cpath d='M45 28l4 4-4 4'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '48px 48px',
                    }}
                    aria-hidden="true"
                  />

                  {/* Chat Header: Avatar RB, "Rahul Bhai", "online" status */}
                  <div className="relative z-10 px-4 py-2.5 bg-[#1F1F1F] dark:bg-[#1F1F1F] light:bg-[#EAEAE4] border-b border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#D0D0CA] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2E2E2E] dark:bg-[#2E2E2E] light:bg-[#D5D5CE] border border-[#444] text-xs font-display font-bold flex items-center justify-center text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] shrink-0">
                      RB
                    </div>

                    <div className="flex flex-col leading-tight">
                      <span className="font-sans font-bold text-sm text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111]">
                        Rahul Bhai
                      </span>
                      <span className="text-[11px] font-sans text-[#70B5A1] flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF3D] inline-block animate-pulse" />
                        online
                      </span>
                    </div>
                  </div>

                  {/* Chat Message Thread */}
                  <div className="relative z-10 p-4 flex flex-col gap-3 min-h-[140px]">
                    {/* Incoming Bubble: User's pasted post, truncated to 2 lines with "..." */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                      className="self-start max-w-[85%] bg-[#282828] dark:bg-[#282828] light:bg-[#E2E2DC] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-xs"
                    >
                      <span className="text-[9px] font-mono text-[#8A8A88] uppercase block mb-0.5 font-bold">
                        YOU FORWARDED:
                      </span>
                      <p className="text-xs font-sans text-[#DDD] dark:text-[#DDD] light:text-[#222] line-clamp-2 leading-relaxed">
                        "{input}"
                      </p>
                    </motion.div>

                    {/* Typing Indicator Bubble: ~1 second */}
                    <AnimatePresence>
                      {isChatTyping && (
                        <motion.div
                          initial={{ y: 8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                          className="self-start bg-[#282828] dark:bg-[#282828] light:bg-[#E2E2DC] rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1 w-fit shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce" />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce"
                            style={{ animationDelay: '0.15s' }}
                          />
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#888] animate-bounce"
                            style={{ animationDelay: '0.3s' }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Outgoing-style Honest Reply Bubble: Acid lime #C8FF3D with black text */}
                    {showRealReply && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        className="self-end max-w-[88%] bg-[#C8FF3D] text-[#0E0E0E] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm flex flex-col gap-1"
                      >
                        {/* Honest text typing in quickly */}
                        <div className="text-sm font-sans font-semibold leading-relaxed text-black">
                          {displayedOutput}
                        </div>

                        {/* Timestamp & Two Ticks (turning from grey to lime/accent) */}
                        <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] font-mono text-black/60 self-end">
                          <span>{replyTimestamp || 'Just now'}</span>

                          {/* Two ticks (double checkmarks) */}
                          <span
                            className={`inline-flex items-center text-xs font-bold leading-none transition-colors duration-500 ${
                              areTicksLime ? 'text-[#057642]' : 'text-neutral-500'
                            }`}
                            title={areTicksLime ? 'Read' : 'Delivered'}
                          >
                            ✓✓
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Copy button sits below the card and copies only the text */}
              <div className="w-full flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs font-display font-bold px-3.5 py-2 rounded-lg bg-[#242424] dark:bg-[#242424] light:bg-[#EAEAEA] text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] hover:bg-[#1F5FBF] hover:text-white transition-colors border border-[#3E3E3E] active:scale-[0.97]"
                >
                  {copiedText}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiet Disclaimer Footer */}
      <footer className="w-full max-w-[480px] px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-[#333]/40 dark:border-[#333]/40 light:border-[#DDD] select-none">
        <p className="text-[12px] opacity-50 text-center font-sans text-[#8A8A88] dark:text-[#8A8A88] light:text-[#777] leading-relaxed">
          Just for fun. Not affiliated with LinkedIn. No real posts were harmed.
        </p>
      </footer>
    </div>
  );
};

export default App;
