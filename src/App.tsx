import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBlob } from 'html-to-image';
import { Mode } from './types';

// Marquee text for the scrolling strip
const MARQUEE_TEXT =
  "THRILLED TO ANNOUNCE ★ HUMBLED & HONORED ★ MY JOURNEY ★ AGREE? ★ GRATEFUL ★ 10X MINDSET ★ SYNERGY ★ ALPHA GRIND ★ DISRUPTING ★ COLD PLUNGE ★ SIMON SINEK QUOTE ★ REACHING OUT ★ THOUGHT LEADER ★ ";

// Example chips for each mode
const LINKEDIN_EXAMPLES = [
  'Aaj maine chai pi',
  'Mera interview kal hai',
  'Maine gym join kiya',
];

const REAL_EXAMPLES = [
  'Excited for a new chapter in my journey!',
  'Humbled and honored to receive this award.',
  'What 4 AM wakeups and cold showers taught me about leadership.',
];

// Placeholder typewriter cycling samples
const LINKEDIN_PLACEHOLDER_SAMPLES = [
  'Aaj maine chai pi...',
  'Mera interview kal hai...',
  'Maine gym join kiya...',
  'Got rejected from a job today...',
];

const REAL_PLACEHOLDER_SAMPLES = [
  'Thrilled to announce my new journey...',
  'Humbled to receive this leadership award...',
  'What 4 AM cold showers taught me...',
  'Grateful for my incredible team. Agree?...',
];

// Cycling loading lines
const LINKEDIN_LOADING_LINES = [
  'Rahul is typing a humble post...',
  'Adding invented leadership lessons...',
  'Tagging 14 people who won\'t reply...',
  'Formatting into one-line paragraphs...',
];

const REAL_LOADING_LINES = [
  'Rahul Bhai is cooking a roast...',
  'Translating corporate speak...',
  'Checking WhatsApp for gossip...',
  'Removing the fake humility...',
];

// Friendly out of office messages when user limit is reached
const USER_LIMIT_MESSAGES = [
  "Bas bhai, aaj ka cringe quota khatam. Chai pi lo, thodi der baad aana.",
  "Humbled to announce that I'm out of office. Back soon.",
  "Itna cringe ek ghante me? Thoda saans lo, phir aana.",
  "Server thak gaya. Thodi der me milte hain.",
];

interface SheetState {
  isOpen: boolean;
  title: string;
  message: string;
  showCountdown: boolean;
}

interface TapHeart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface FloatingParticle {
  id: number;
  type: 'thumb' | 'heart' | 'clap';
  dx: number;
  dy: number;
  rotate: number;
}

export const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('to-linkedin');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [displayedOutput, setDisplayedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingLineIndex, setLoadingLineIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [reactionCount, setReactionCount] = useState<number>(0);
  const [targetReactions, setTargetReactions] = useState<number>(1284);
  const [isPostExpanded, setIsPostExpanded] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [tapHearts, setTapHearts] = useState<TapHeart[]>([]);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [lastType, setLastType] = useState<string | undefined>(undefined);
  const [isSavingImage, setIsSavingImage] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [hasTappedInput, setHasTappedInput] = useState<boolean>(false);
  const [placeholderText, setPlaceholderText] = useState<string>('');
  const [isBasicMode, setIsBasicMode] = useState<boolean>(false);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [sheetState, setSheetState] = useState<SheetState>({
    isOpen: false,
    title: 'Out of Office',
    message: '',
    showCountdown: false,
  });
  const lastLimitMsgIndexRef = useRef<number>(-1);
  const cardRef = useRef<HTMLDivElement>(null);

  // Pick random user limit message avoiding the previous one
  const getNextUserLimitMessage = () => {
    const eligible = [0, 1, 2, 3].filter((i) => i !== lastLimitMsgIndexRef.current);
    const nextIdx = eligible[Math.floor(Math.random() * eligible.length)];
    lastLimitMsgIndexRef.current = nextIdx;
    return USER_LIMIT_MESSAGES[nextIdx];
  };

  // Countdown timer for user limit retry
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCountdown]);

  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `Wapas aao: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // "To Real" Chat Parody State
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);
  const [showRealReply, setShowRealReply] = useState<boolean>(false);
  const [areTicksLime, setAreTicksLime] = useState<boolean>(false);
  const [replyTimestamp, setReplyTimestamp] = useState<string>('');

  // Easter Egg State
  const [isOpenToWorkActive, setIsOpenToWorkActive] = useState<boolean>(false);
  const [isWordmarkSquished, setIsWordmarkSquished] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(0);
  const [hasFoundEasterEgg, setHasFoundEasterEgg] = useState<boolean>(false);
  const tapTimestampsRef = useRef<number[]>([]);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const easterEggDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Placeholder typewriter loop (40ms/char, 1.5s pause, deletes, next; stops immediately when tapped or focused)
  useEffect(() => {
    if (hasTappedInput || isInputFocused || input.length > 0 || prefersReducedMotion) {
      setPlaceholderText('');
      return;
    }

    const samples = mode === 'to-linkedin' ? LINKEDIN_PLACEHOLDER_SAMPLES : REAL_PLACEHOLDER_SAMPLES;
    let sampleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const currentSample = samples[sampleIdx];
      if (!isDeleting) {
        charIdx++;
        setPlaceholderText(currentSample.slice(0, charIdx));
        if (charIdx >= currentSample.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 1500);
          return;
        }
        timeoutId = setTimeout(tick, 40);
      } else {
        charIdx--;
        setPlaceholderText(currentSample.slice(0, charIdx));
        if (charIdx <= 0) {
          isDeleting = false;
          sampleIdx = (sampleIdx + 1) % samples.length;
          timeoutId = setTimeout(tick, 300);
          return;
        }
        timeoutId = setTimeout(tick, 25);
      }
    };

    timeoutId = setTimeout(tick, 400);
    return () => clearTimeout(timeoutId);
  }, [mode, hasTappedInput, isInputFocused, input, prefersReducedMotion]);

  // Loading humorous line cycler (cycles through 4 funny lines with a fade)
  useEffect(() => {
    if (!isLoading) {
      setLoadingLineIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingLineIndex((prev) => (prev + 1) % 4);
    }, 1400);
    return () => clearInterval(timer);
  }, [isLoading]);

  // Handle Easter Egg: 5 taps within 3 seconds
  const handleWordmarkTap = () => {
    // Wordmark squishes on tap (scaleY: 0.92)
    setIsWordmarkSquished(true);
    setTimeout(() => setIsWordmarkSquished(false), 140);

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

      // Step 1: pasted post appears first as a grey bubble (initial render).
      // Step 2: after 200ms delay, show "typing..." bubble for 1s.
      setIsChatTyping(false);
      setShowRealReply(false);
      setAreTicksLime(false);

      const typingStartTimer = setTimeout(() => {
        setIsChatTyping(true);

        const replyLandTimer = setTimeout(() => {
          setIsChatTyping(false);
          setShowRealReply(true);

          // Haptic vibrate(10) when reply lands
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
          }

          // Two ticks turn lime after 1 second
          const ticksTimer = setTimeout(() => {
            setAreTicksLime(true);
          }, 1000);

          return () => clearTimeout(ticksTimer);
        }, 1000);

        return () => clearTimeout(replyLandTimer);
      }, 200);

      return () => clearTimeout(typingStartTimer);
    }
  }, [output, mode, prefersReducedMotion]);

  // Output decoding and reaction count animation
  useEffect(() => {
    if (!output) {
      setDisplayedOutput('');
      setIsPostExpanded(false);
      setIsLiked(false);
      setFloatingParticles([]);
      return;
    }

    setIsPostExpanded(false);
    setIsLiked(false);

    if (prefersReducedMotion) {
      setDisplayedOutput(output);
      setReactionCount(targetReactions);
      return;
    }

    if (mode === 'to-linkedin') {
      // Haptic feedback
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }

      // Reaction counter ticks up with easing over 1s (easeOutCubic)
      setReactionCount(0);
      const counterStartTime = performance.now();
      const counterDuration = 1000;
      let counterFrame: number;

      const tickCounter = (now: number) => {
        const elapsed = now - counterStartTime;
        const progress = Math.min(1, elapsed / counterDuration);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setReactionCount(Math.round(targetReactions * easeOutCubic));
        if (progress < 1) {
          counterFrame = requestAnimationFrame(tickCounter);
        }
      };
      counterFrame = requestAnimationFrame(tickCounter);

      // Scramble decode effect: characters scramble ~300ms then resolve left to right line by line (< 1.5s total)
      const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%*@&!?';
      const decodeStartTime = performance.now();
      const totalDuration = 1200;
      const scrambleInitial = 250;
      let decodeFrame: number;

      const tickDecode = (now: number) => {
        const elapsed = now - decodeStartTime;
        if (elapsed >= totalDuration) {
          setDisplayedOutput(output);
          return;
        }

        const progress = Math.max(0, (elapsed - scrambleInitial) / (totalDuration - scrambleInitial));
        const resolvedCount = Math.floor(output.length * progress);

        let result = '';
        for (let i = 0; i < output.length; i++) {
          const char = output[i];
          if (char === '\n' || char === ' ' || char === '\t') {
            result += char;
          } else if (i < resolvedCount) {
            result += char;
          } else if (i < resolvedCount + 10) {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        setDisplayedOutput(result);
        decodeFrame = requestAnimationFrame(tickDecode);
      };

      decodeFrame = requestAnimationFrame(tickDecode);

      return () => {
        if (counterFrame) cancelAnimationFrame(counterFrame);
        if (decodeFrame) cancelAnimationFrame(decodeFrame);
      };
    }

    if (mode === 'to-real') {
      if (!showRealReply) {
        setDisplayedOutput('');
        return;
      }

      // Fast typing for the honest roast reply (completes in ~350ms)
      setDisplayedOutput('');
      const totalSteps = 22;
      const charsPerStep = Math.max(1, Math.ceil(output.length / totalSteps));
      let currentIdx = 0;
      const timer = setInterval(() => {
        currentIdx = Math.min(output.length, currentIdx + charsPerStep);
        setDisplayedOutput(output.slice(0, currentIdx));
        if (currentIdx >= output.length) {
          clearInterval(timer);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [output, showRealReply, mode, targetReactions, prefersReducedMotion]);

  const handleTranslate = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setErrorMsg('Kuch likh toh pehle');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }
    if (isLoading) return;

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
        body: JSON.stringify({
          text: trimmed,
          mode,
          lastType: mode === 'to-linkedin' ? lastType : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const retrySec = typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : 3600;
        setRetryCountdown(retrySec);
        setSheetState({
          isOpen: true,
          title: 'Out of Office',
          message: getNextUserLimitMessage(),
          showCountdown: true,
        });
        return;
      }

      if (data.notice === 'daily_cap') {
        setIsBasicMode(true);
        if (typeof window !== 'undefined' && !sessionStorage.getItem('cringein_daily_cap_notified')) {
          sessionStorage.setItem('cringein_daily_cap_notified', 'true');
          setSheetState({
            isOpen: true,
            title: 'Out of Office',
            message: 'Aaj ka AI quota khatam. Basic mode chal raha hai, kal full cringe milega.',
            showCountdown: false,
          });
        }
      }

      if (data.result) {
        setOutput(data.result);
        setHasTranslated(true);
        if (data.type) {
          setLastType(data.type);
        }
      } else if (data.error) {
        setErrorMsg('Thoda ruk ke try karo.');
      }
    } catch (err) {
      setErrorMsg('Server thoda busy hai, thodi der me try karo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current || isSavingImage) return;
    setIsSavingImage(true);

    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      if (!blob) throw new Error('Could not generate image blob');

      const fileName = `cringein-${mode}-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Try Web Share API if supported on mobile
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: 'CringeIn',
            text: 'Generated with CringeIn (@cringein.official)',
          });
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            return;
          }
        }
      }

      // Download fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    if (nextLiked) {
      setReactionCount((prev) => prev + 1);
    } else {
      setReactionCount((prev) => Math.max(0, prev - 1));
    }

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    if (nextLiked && !prefersReducedMotion) {
      // 6 to 8 tiny reaction icons (simple SVG thumb/heart/clap)
      const types: ('thumb' | 'heart' | 'clap')[] = [
        'thumb',
        'heart',
        'clap',
        'thumb',
        'heart',
        'clap',
        'thumb',
      ];
      const particles: FloatingParticle[] = [];
      const count = 7;
      const now = Date.now();
      for (let i = 0; i < count; i++) {
        particles.push({
          id: now + i,
          type: types[i % types.length],
          dx: (Math.random() - 0.5) * 56,
          dy: -45 - Math.random() * 35,
          rotate: (Math.random() - 0.5) * 40,
        });
      }
      setFloatingParticles(particles);
      setTimeout(() => {
        setFloatingParticles([]);
      }, 800);
    }
  };

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // If text is still decoding, instant resolve on card tap
    if (output && displayedOutput !== output) {
      setDisplayedOutput(output);
    }

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
      {/* 1. Subtle Film Grain Overlay with 150ms stepped shift */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] bg-grain animate-grain"
        aria-hidden="true"
      />

      {/* 2. Soft Background Tint that drifts slowly (30s loop) and cross-fades to mode color over 400ms */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-400 animate-ambient-drift"
        style={{
          background: isOpenToWorkActive
            ? 'radial-gradient(ellipse 100% 70% at 50% 30%, rgba(5, 118, 66, 0.45) 0%, rgba(112, 181, 161, 0.18) 50%, transparent 80%)'
            : isLinkedInMode
              ? 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(31, 95, 191, 0.16) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 80% 50% at 50% 32%, rgba(200, 255, 61, 0.13) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Easter Egg Background Tint Flash (2s duration) */}
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
          {/* Easter Egg #OPENTOWORK Arc / Ribbon Banner with stroke animation */}
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
                <div className="relative px-3.5 py-1 bg-[#057642] text-white rounded-full border border-[#70B5A1] shadow-lg flex items-center gap-1.5 overflow-hidden">
                  {/* Stroke animation on ribbon */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <motion.rect
                      x="1"
                      y="1"
                      width="98"
                      height="98"
                      rx="49"
                      fill="none"
                      stroke="#A3E635"
                      strokeWidth="3"
                      initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  <span className="w-2 h-2 rounded-full bg-[#70B5A1] animate-ping" />
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-[#F2F0E8] leading-none">
                    #OPENTOWORK
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center relative">
            {/* Wordmark with squish (scaleY: 0.92) and 5-tap Easter Egg listener */}
            <motion.div
              onClick={handleWordmarkTap}
              animate={
                isOpenToWorkActive && !prefersReducedMotion
                  ? { rotate: [0, -6, 6, -5, 5, -2, 2, 0], scaleY: 1, scaleX: 1 }
                  : isWordmarkSquished
                    ? { scaleY: 0.92, scaleX: 1.05, rotate: 0 }
                    : { scaleY: 1, scaleX: 1, rotate: 0 }
              }
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="inline-block cursor-pointer select-none origin-bottom relative"
              style={{
                touchAction: 'manipulation',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            >
              {/* Optional animated stroke ribbon around wordmark on Easter egg activation */}
              {isOpenToWorkActive && (
                <svg
                  className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none z-20"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <motion.rect
                    x="2"
                    y="2"
                    width="96"
                    height="96"
                    rx="12"
                    fill="none"
                    stroke="#70B5A1"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  />
                </svg>
              )}

              <h1 className="font-display font-extrabold text-[44px] sm:text-[56px] tracking-tighter leading-none text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#141414] flex items-center">
                {'Cringe'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={prefersReducedMotion ? { opacity: 0 } : { y: -24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 18,
                      delay: prefersReducedMotion ? 0 : i * 0.04,
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}

                {/* "In" box: pops in last with slight overshoot settling at 3 degree tilt, then idles with gentle wobble */}
                <motion.span
                  initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 16,
                    delay: prefersReducedMotion ? 0 : 0.28,
                  }}
                  className="ml-0.5 inline-block"
                >
                  <span className="inline-flex items-center justify-center bg-[#1F5FBF] text-white px-2 py-0.5 rounded-[9px] text-[32px] sm:text-[42px] leading-none shadow-sm animate-in-wobble">
                    In
                  </span>
                </motion.span>
              </h1>
            </motion.div>
          </div>

          {/* Easter Egg Hint Sticker Pill with scale pop on tap */}
          <div className="flex items-center pt-0.5 pb-1">
            <motion.div
              key={tapCount}
              animate={
                prefersReducedMotion
                  ? {}
                  : tapCount > 0
                    ? { scale: [1, 1.25, 1], y: [-2, 2, -2] }
                    : { y: [-2, 2, -2] }
              }
              transition={{
                duration: tapCount > 0 ? 0.22 : 3,
                repeat: tapCount > 0 ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              className={`rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5 border border-dashed transition-colors duration-200 select-none ${isOpenToWorkActive
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

          {/* Tagline: fades up 12px */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.46, duration: 0.35, ease: 'easeOut' }}
            className="min-h-[20px] overflow-hidden"
          >
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
          </motion.div>
        </header>

        {/* Marquee Strip: LinkedIn Cliches (fades in after wordmark) */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.38, duration: 0.4 }}
          className="w-full overflow-hidden whitespace-nowrap border-y border-[#262626] dark:border-[#262626] light:border-[#E5E5E0] py-1 text-[10px] font-mono tracking-widest text-[#70706C] select-none"
          aria-hidden="true"
        >
          <div className="animate-marquee">
            <span>{MARQUEE_TEXT}</span>
            <span>{MARQUEE_TEXT}</span>
          </div>
        </motion.div>

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
            className={`relative z-10 h-11 rounded-lg text-sm font-display font-extrabold transition-colors flex items-center justify-center border-2 border-transparent ${isLinkedInMode ? 'text-white' : 'text-[#888] hover:text-white'
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
            className={`relative z-10 h-11 rounded-lg text-sm font-display font-extrabold transition-colors flex items-center justify-center border-2 border-transparent ${!isLinkedInMode ? 'text-black' : 'text-[#888] hover:text-white'
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

        {/* Middle: Text Input with typewriter placeholder & focus spring scale 1.01 */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.56, duration: 0.4, ease: 'easeOut' }}
          className="w-full relative flex flex-col gap-2"
        >
          <motion.textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPointerDown={() => setHasTappedInput(true)}
            onFocus={() => {
              setHasTappedInput(true);
              setIsInputFocused(true);
            }}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            animate={{ scale: isInputFocused ? 1.01 : 1 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            placeholder={
              hasTappedInput || isInputFocused || input
                ? isLinkedInMode
                  ? 'Aaj maine ek app banayi...'
                  : 'Paste a LinkedIn post here...'
                : placeholderText ||
                (isLinkedInMode
                  ? 'Aaj maine ek app banayi...'
                  : 'Paste a LinkedIn post here...')
            }
            className={`w-full bg-[#161616] dark:bg-[#161616] light:bg-white border-2 rounded-xl p-3.5 text-base text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] placeholder:text-[#666] focus:outline-none resize-none leading-relaxed transition-colors shadow-soft-card ${isInputFocused
                ? isLinkedInMode
                  ? 'border-[#1F5FBF]'
                  : 'border-[#C8FF3D]'
                : 'border-[#2C2C2C] dark:border-[#2C2C2C] light:border-[#D8D8D2]'
              }`}
          />

          {/* Example Chips (stagger in from below, press-scale to 0.95 on tap) */}
          {!hasTranslated && !output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap items-center gap-1.5 pt-0.5 select-none"
            >
              {(isLinkedInMode ? LINKEDIN_EXAMPLES : REAL_EXAMPLES).map((chip, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => setInput(chip)}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.65 + idx * 0.05, duration: 0.2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#1A1A1A] dark:bg-[#1A1A1A] light:bg-[#EAEAE6] text-[#888] dark:text-[#888] light:text-[#555] hover:text-[#F2F0E8] dark:hover:text-[#F2F0E8] light:hover:text-[#111] hover:border-[#444] border border-[#2B2B2B] dark:border-[#2B2B2B] light:border-[#DDD] transition-colors cursor-pointer truncate max-w-full"
                >
                  "{chip}"
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

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

        {/* Primary Action Button: Idle shadow pulse, tap collapse & vibrate, loading morph & funny lines */}
        <motion.button
          type="button"
          disabled={isLoading || retryCountdown > 0}
          onClick={handleTranslate}
          onPointerDown={() => {
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate(10);
            }
          }}
          whileTap={
            retryCountdown > 0
              ? {}
              : {
                x: 4,
                y: 4,
                scale: 0.97,
                boxShadow: '0px 0px 0px transparent',
              }
          }
          className={`w-full h-14 rounded-xl text-base font-display font-extrabold uppercase tracking-wide border-2 border-black dark:border-black flex items-center justify-center shadow-hard-dark dark:shadow-hard-dark light:shadow-hard-light btn-pressable ${!hasTranslated && !isLoading && retryCountdown === 0 ? 'animate-shadow-pulse' : ''
            } ${retryCountdown > 0
              ? 'bg-[#222] dark:bg-[#222] light:bg-[#DDD] text-[#888] cursor-not-allowed opacity-90'
              : isLinkedInMode
                ? 'bg-[#1F5FBF] text-white hover:brightness-105'
                : 'bg-[#C8FF3D] text-black hover:bg-acidlime-hover'
            } ${isLoading ? 'opacity-90' : ''}`}
        >
          {retryCountdown > 0 ? (
            <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-[#C8FF3D] dark:text-[#C8FF3D] light:text-[#057642]">
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>{formatCountdown(retryCountdown)}</span>
            </span>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <div className="flex items-center gap-1.5 py-0.5">
                <motion.span
                  className="w-2 h-2 rounded-full bg-current"
                  animate={prefersReducedMotion ? {} : { y: [-3, 3, -3] }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                  className="w-2 h-2 rounded-full bg-current"
                  animate={prefersReducedMotion ? {} : { y: [-3, 3, -3] }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                />
                <motion.span
                  className="w-2 h-2 rounded-full bg-current"
                  animate={prefersReducedMotion ? {} : { y: [-3, 3, -3] }}
                  transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
              <div className="h-4 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingLineIndex}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="normal-case text-[11px] font-sans font-medium tracking-normal opacity-90 truncate max-w-[280px]"
                  >
                    {(isLinkedInMode ? LINKEDIN_LOADING_LINES : REAL_LOADING_LINES)[loadingLineIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          ) : isLinkedInMode ? (
            'Make it LinkedIn'
          ) : (
            'What do they mean'
          )}
        </motion.button>

        {/* OUTPUT CARD CONTAINER WITH 3D FLIP */}
        <div className="w-full flex flex-col gap-3" style={{ perspective: 1000 }}>
          <AnimatePresence mode="wait">
            {output && (
              <motion.div
                key={mode}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, translateY: 40, scale: 0.96, rotateX: -30 }
                }
                animate={{ opacity: 1, translateY: 0, scale: 1, rotateX: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, rotateX: 50, scale: 0.94, transition: { duration: 0.25 } }
                }
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className="w-full flex flex-col gap-3"
              >
                {/* TO LINKEDIN PARODY CARD */}
                {isLinkedInMode ? (
                  <div
                    ref={cardRef}
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
                            USER
                          </span>

                          <span className="inline-flex items-center text-[10px] font-sans font-semibold text-[#1F5FBF] bg-[#1F5FBF]/10 dark:bg-[#1F5FBF]/20 border border-[#1F5FBF]/30 px-2 py-0.5 rounded-full leading-none">
                            Verified Humble
                          </span>

                          {isBasicMode && (
                            <span className="inline-flex items-center text-[9px] font-mono uppercase text-[#888] dark:text-[#777] bg-[#222]/30 dark:bg-[#222]/40 light:bg-[#EAEAE4] border border-[#444]/30 px-1.5 py-0.5 rounded leading-none select-none">
                              basic mode
                            </span>
                          )}
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
                        className={`text-sm sm:text-base font-sans text-[#141414] dark:text-[#F2F0E8] whitespace-pre-wrap leading-relaxed select-text cursor-text ${!isPostExpanded && isLongPost ? 'line-clamp-3' : ''
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (output && displayedOutput !== output) {
                            setDisplayedOutput(output);
                          }
                        }}
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

                    {/* Reaction Row: Sequential pop of 3 circles, counter ticks up with easing */}
                    <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] flex items-center justify-between text-[11px] font-mono text-[#666] dark:text-[#8A8A88]">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center -space-x-1.5">
                          {/* Reaction circle 1: Like */}
                          <motion.div
                            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 20,
                              delay: prefersReducedMotion ? 0 : 0.1,
                            }}
                            className="w-4 h-4 rounded-full bg-[#1F5FBF] text-white flex items-center justify-center border border-white dark:border-[#1A1A1A] z-30"
                          >
                            <svg
                              className="w-2.5 h-2.5 stroke-white fill-none"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                          </motion.div>

                          {/* Reaction circle 2: Celebrate */}
                          <motion.div
                            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 20,
                              delay: prefersReducedMotion ? 0 : 0.2,
                            }}
                            className="w-4 h-4 rounded-full bg-[#E040FB] text-white flex items-center justify-center border border-white dark:border-[#1A1A1A] z-20"
                          >
                            <svg
                              className="w-2.5 h-2.5 stroke-white fill-none"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          </motion.div>

                          {/* Reaction circle 3: Insightful */}
                          <motion.div
                            initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 20,
                              delay: prefersReducedMotion ? 0 : 0.3,
                            }}
                            className="w-4 h-4 rounded-full bg-[#C8FF3D] text-black flex items-center justify-center border border-white dark:border-[#1A1A1A] z-10"
                          >
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
                          </motion.div>
                        </div>

                        <span className="font-bold text-[#141414] dark:text-[#F2F0E8]">
                          {reactionCount.toLocaleString()}
                        </span>
                      </div>

                      <span>86 comments</span>
                    </div>

                    {/* Action Row: Like button with scale pop & simple SVG (thumb/heart/clap) particles */}
                    <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] grid grid-cols-4 text-xs font-sans text-[#666] dark:text-[#8A8A88]">
                      <div className="relative flex items-center justify-center">
                        {floatingParticles.map((p) => (
                          <motion.span
                            key={p.id}
                            initial={{ x: 0, y: 0, scale: 0.5, opacity: 1, rotate: 0 }}
                            animate={{ x: p.dx, y: p.dy, scale: 1.15, opacity: 0, rotate: p.rotate }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="absolute pointer-events-none z-30 select-none flex items-center justify-center p-1 bg-white/90 dark:bg-[#2A2A2A]/90 rounded-full shadow-xs border border-white/20"
                          >
                            {p.type === 'thumb' && (
                              <svg className="w-3 h-3 fill-[#1F5FBF]" viewBox="0 0 24 24">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                              </svg>
                            )}
                            {p.type === 'heart' && (
                              <svg className="w-3 h-3 fill-[#E040FB]" viewBox="0 0 24 24">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                              </svg>
                            )}
                            {p.type === 'clap' && (
                              <svg className="w-3 h-3 fill-[#C8FF3D] stroke-black stroke-[0.8]" viewBox="0 0 24 24">
                                <path d="M4 14l5-5 3 3-5 5z" />
                                <path d="M15 9l5-5-3-3-5 5z" />
                              </svg>
                            )}
                          </motion.span>
                        ))}
                        <button
                          type="button"
                          onClick={handleLikeToggle}
                          className={`w-full flex items-center justify-center gap-1.5 py-1 transition-colors ${isLiked
                              ? 'text-[#1F5FBF] font-bold'
                              : 'hover:text-[#1F5FBF]'
                            }`}
                        >
                          <motion.svg
                            animate={isLiked ? { scale: [1, 1.4, 0.9, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`w-4 h-4 stroke-current ${isLiked ? 'fill-[#1F5FBF]' : 'fill-none'
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
                      </div>

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

                    {/* Faint Fake Comment Strip at Bottom (slides in last with 600ms delay) */}
                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: 0.35, ease: 'easeOut' }}
                      className="pt-2 border-t border-[#EAEAEA] dark:border-[#262626] flex items-center justify-between text-[11px] font-sans text-[#888] dark:text-[#777]"
                    >
                      <div className="flex items-center gap-2 opacity-75 truncate">
                        <div className="w-5 h-5 rounded-full bg-[#DDD] dark:bg-[#333] flex items-center justify-center text-[9px] font-bold text-[#555] dark:text-[#AAA] shrink-0">
                          AP
                        </div>
                        <span className="truncate">
                          "Great insights! Thanks for sharing."
                        </span>
                      </div>
                      {/* Watermark in bottom corner */}
                      <span className="text-[10px] font-mono text-[#888] dark:text-[#666] opacity-50 shrink-0 ml-2 select-none">
                        @cringein.official
                      </span>
                    </motion.div>
                  </div>
                ) : (
                  /* TO REAL MODE: PRIVATE CHAT PARODY CARD */
                  <div
                    ref={cardRef}
                    className="relative w-full bg-[#181818] dark:bg-[#181818] light:bg-[#F2F2EE] border border-[#2E2E2E] dark:border-[#2E2E2E] light:border-[#D5D5CE] rounded-xl overflow-hidden shadow-soft-card flex flex-col select-none"
                  >
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
                          {isBasicMode && (
                            <span className="text-[9px] font-mono uppercase text-[#888] dark:text-[#777] bg-[#222]/30 dark:bg-[#222]/40 light:bg-[#EAEAE4] border border-[#444]/30 px-1.5 py-0.5 rounded leading-none select-none ml-1">
                              basic mode
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Chat Message Thread */}
                    <div className="relative z-10 p-4 flex flex-col gap-3 min-h-[140px]">
                      {/* Incoming Bubble: User's pasted post (slide up & fade) */}
                      <motion.div
                        initial={prefersReducedMotion ? { opacity: 1 } : { y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                        className="self-start max-w-[85%] bg-[#282828] dark:bg-[#282828] light:bg-[#E2E2DC] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-xs"
                      >
                        <span className="text-[9px] font-mono text-[#8A8A88] uppercase block mb-0.5 font-bold">
                          YOU FORWARDED:
                        </span>
                        <p className="text-xs font-sans text-[#DDD] dark:text-[#DDD] light:text-[#222] line-clamp-2 leading-relaxed">
                          "{input}"
                        </p>
                      </motion.div>

                      {/* Typing Indicator Bubble: 1 second */}
                      <AnimatePresence>
                        {isChatTyping && (
                          <motion.div
                            initial={prefersReducedMotion ? { opacity: 1 } : { y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
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

                      {/* Honest Reply Bubble: Acid lime #C8FF3D with tiny overshoot and fast typing */}
                      {showRealReply && (
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 1 } : { y: 16, opacity: 0, scale: 0.95 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                          className="self-end max-w-[88%] bg-[#C8FF3D] text-[#0E0E0E] rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm flex flex-col gap-1"
                        >
                          {/* Honest text typing in quickly */}
                          <div className="text-sm font-sans font-semibold leading-relaxed text-black">
                            {displayedOutput}
                          </div>

                          {/* Timestamp & Two Ticks (turning from grey to lime after 1s) */}
                          <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] font-mono text-black/60 self-end">
                            <span>{replyTimestamp || 'Just now'}</span>

                            <span
                              className={`inline-flex items-center text-xs font-bold leading-none transition-colors duration-500 ${areTicksLime ? 'text-[#057642]' : 'text-neutral-500'
                                }`}
                              title={areTicksLime ? 'Read' : 'Delivered'}
                            >
                              ✓✓
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Watermark in bottom corner */}
                      <div className="flex justify-end pt-1">
                        <span className="text-[10px] font-mono text-[#888] dark:text-[#666] opacity-50 select-none">
                          @cringein.official
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons below the card: Save image & Copy */}
                <div className="w-full flex justify-end items-center gap-2 pt-1 select-none">
                  <button
                    type="button"
                    onClick={handleSaveImage}
                    disabled={isSavingImage}
                    className="text-xs font-display font-bold px-3 py-2 rounded-lg bg-[#242424] dark:bg-[#242424] light:bg-[#EAEAEA] text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] hover:bg-[#333] transition-colors border border-[#3E3E3E] active:scale-[0.97] flex items-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5 stroke-current fill-none shrink-0"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{isSavingImage ? 'Saving...' : 'Save image'}</span>
                  </button>

                  {/* Copy button slides up to "Copied. Go post it, coward." for 1.5s with check icon stroke animation */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs font-display font-bold px-3.5 py-2 rounded-lg bg-[#242424] dark:bg-[#242424] light:bg-[#EAEAEA] text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#111] hover:bg-[#1F5FBF] hover:text-white transition-colors border border-[#3E3E3E] active:scale-[0.97] min-w-[72px] h-[35px] flex items-center justify-center overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {isCopied ? (
                        <motion.span
                          key="copied"
                          initial={prefersReducedMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5 text-[#C8FF3D] dark:text-[#C8FF3D] light:text-[#057642]"
                        >
                          <svg
                            className="w-3.5 h-3.5 stroke-current fill-none shrink-0"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                            />
                          </svg>
                          <span>Copied. Go post it, coward.</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={prefersReducedMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { y: -10, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          Copy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Quiet Disclaimer Footer */}
      <footer className="w-full max-w-[480px] px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-[#333]/40 dark:border-[#333]/40 light:border-[#DDD] select-none">
        <p className="text-[12px] opacity-50 text-center font-sans text-[#8A8A88] dark:text-[#8A8A88] light:text-[#777] leading-relaxed">
          Just for fun. Not affiliated with LinkedIn. No real posts were harmed.
        </p>
      </footer>
      {/* Friendly Limit-Reached "Out of Office" Bottom Sheet */}
      <AnimatePresence>
        {sheetState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSheetState((prev) => ({ ...prev, isOpen: false }))}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="relative w-full max-w-[420px] bg-[#181818] dark:bg-[#181818] light:bg-[#FAFAF7] border border-[#2E2E2E] dark:border-[#2E2E2E] light:border-[#D5D5CE] rounded-xl p-5 shadow-hard-dark dark:shadow-hard-dark light:shadow-hard-light flex flex-col gap-3.5 overflow-hidden"
            >
              {/* Rubber-stamp style OUT OF OFFICE slap-on badge */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { scale: 2.2, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: -4 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: prefersReducedMotion ? 0 : 0.15,
                }}
                onAnimationComplete={() => {
                  if (!prefersReducedMotion && typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(10);
                  }
                }}
                className="absolute top-4 right-4 border-2 border-[#FF5A5A] text-[#FF5A5A] px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase tracking-widest select-none pointer-events-none opacity-90 shadow-xs"
                style={{ transformOrigin: 'center center' }}
              >
                OUT OF OFFICE
              </motion.div>

              {/* Small Label */}
              <div className="flex items-center">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#888] dark:text-[#888] light:text-[#777]">
                  AUTO-REPLY
                </span>
              </div>

              {/* Headline & Body */}
              <div className="flex flex-col gap-1 pr-14">
                <h3 className="font-display font-extrabold text-xl text-[#F2F0E8] dark:text-[#F2F0E8] light:text-[#141414] leading-tight">
                  {sheetState.title}
                </h3>
                <p className="font-sans text-sm text-[#CCCCCC] dark:text-[#CCCCCC] light:text-[#444] leading-relaxed">
                  {sheetState.message}
                </p>
              </div>

              {/* Live Countdown if user_limit */}
              {sheetState.showCountdown && retryCountdown > 0 && (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C8FF3D] bg-[#222] dark:bg-[#222] light:bg-[#EAEAE4] px-3 py-1.5 rounded-lg border border-[#333] dark:border-[#333] light:border-[#DDD] w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#C8FF3D] animate-ping" />
                  <span>{formatCountdown(retryCountdown)}</span>
                </div>
              )}

              {/* Action Button: "Theek hai" */}
              <button
                type="button"
                onClick={() => setSheetState((prev) => ({ ...prev, isOpen: false }))}
                className="w-full h-11 rounded-lg text-sm font-display font-extrabold uppercase tracking-wide bg-[#1F5FBF] text-white hover:brightness-105 active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center cursor-pointer mt-1"
              >
                Theek hai
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
