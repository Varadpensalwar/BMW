// src/App.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './App.css';
import videoData from './videoData';
import BackgroundAnimation from './components/BackgroundAnimation';
import VideoCard from './components/VideoCard';
import EasterEggButton from './components/EasterEggButton';

function App() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [autoplayEnabled, setAutoplayEnabled] = useState(true);
    const [easterEggActive, setEasterEggActive] = useState(false);
    const [vibrationIntensity, setVibrationIntensity] = useState('medium');
    const [isVibrating, setIsVibrating] = useState(false);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [installPromptDismissed, setInstallPromptDismissed] = useState(false);
    const [globalPlayingState, setGlobalPlayingState] = useState({}); // Track playing state for each video
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const animationFrameRef = useRef(null);
    const currentVideoRef = useRef(null);
    const deferredPromptRef = useRef(null);
    const hasUserInteracted = useRef(false);

    // Track Konami Code for Easter Egg
    const konamiCodeSequence = useMemo(() =>
        ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'],
        []
    );
    const [konamiCodePosition, setKonamiCodePosition] = useState(0);

    // Clean up audio context properly
    const cleanupAudioContext = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.disconnect();
            } catch (e) {
                console.log('Source node already disconnected');
            }
            sourceNodeRef.current = null;
        }
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try {
                audioContextRef.current.close();
            } catch (e) {
                console.log('Audio context already closed');
            }
            audioContextRef.current = null;
        }
        
        analyserRef.current = null;
        currentVideoRef.current = null;
    }, []);

    // Initialize audio analyzer with proper cleanup
    const setupAudioAnalyzer = useCallback(() => {
        if (!isMobile || !('vibrate' in navigator) || !hasUserInteracted.current) return;

        // Clean up any existing audio context first
        cleanupAudioContext();

        try {
            // Find the current active video element
            const activeVideoCard = document.querySelector('.video-card.active');
            const videoElement = activeVideoCard?.querySelector('video');
            
            if (!videoElement || videoElement.readyState < 2) {
                console.log('Video element not ready for audio analysis');
                return;
            }

            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();

            // Resume if suspended
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            // Create analyzer
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 32;
            analyserRef.current.smoothingTimeConstant = 0.5;

            // Create source from video element
            sourceNodeRef.current = audioContextRef.current.createMediaElementSource(videoElement);
            sourceNodeRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);

            currentVideoRef.current = videoElement;

            // Start audio monitoring
            const startAudioMonitoring = () => {
                if (!analyserRef.current || !isMobile || !('vibrate' in navigator)) return;

                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const analyzeAudio = () => {
                    if (!analyserRef.current || !currentVideoRef.current) return;
                    
                    // Check if the video is still playing and is the current video
                    const activeVideo = document.querySelector('.video-card.active video');
                    if (!activeVideo || activeVideo !== currentVideoRef.current || activeVideo.paused) {
                        return; // Stop analysis if video changed or paused
                    }

                    analyserRef.current.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const averageVolume = sum / bufferLength;

                    let newIntensity;
                    if (averageVolume < 50) {
                        newIntensity = 'low';
                    } else if (averageVolume < 120) {
                        newIntensity = 'medium';
                    } else {
                        newIntensity = 'high';
                    }

                    if (newIntensity !== vibrationIntensity || !isVibrating) {
                        setVibrationIntensity(newIntensity);

                        if (averageVolume > 20) {
                            setIsVibrating(true);
                            const duration = Math.min(Math.floor(averageVolume), 200);

                            let pattern;
                            if (newIntensity === 'high') {
                                pattern = [duration, duration / 2];
                            } else if (newIntensity === 'medium') {
                                pattern = [duration, duration];
                            } else {
                                pattern = [duration / 2];
                            }

                            if (Math.random() < 0.2) {
                                pattern = pattern.map(p => p + Math.floor(Math.random() * 20 - 10));
                            }

                            navigator.vibrate(pattern);

                            const totalDuration = pattern.reduce((sum, val) => sum + val, 0);
                            setTimeout(() => {
                                setIsVibrating(false);
                            }, totalDuration + 10);
                        }
                    }

                    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
                };

                analyzeAudio();
            };

            startAudioMonitoring();
        } catch (error) {
            console.error("Error setting up audio analyzer:", error);
            cleanupAudioContext();
        }
    }, [isMobile, vibrationIntensity, isVibrating, cleanupAudioContext]);

    // Handle video state changes
    const handleVideoStateChange = useCallback((videoIndex, isPlaying) => {
        setGlobalPlayingState(prev => ({
            ...prev,
            [videoIndex]: isPlaying
        }));
    }, []);

    // Check if mobile and setup install prompt
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth <= 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const promptDismissed = localStorage.getItem('installPromptDismissed');
        if (promptDismissed) {
            setInstallPromptDismissed(true);
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPromptRef.current = e;

            if (!promptDismissed) {
                setTimeout(() => {
                    setShowInstallPrompt(true);
                }, 5000);
            }
        });

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Setup audio analyzer when videos change or when user interacts
    useEffect(() => {
        if (isMobile && hasUserInteracted.current) {
            const timeoutId = setTimeout(() => {
                setupAudioAnalyzer();
            }, 1000); // Increased delay to ensure video is ready

            return () => clearTimeout(timeoutId);
        }
    }, [currentVideoIndex, isMobile, setupAudioAnalyzer]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            cleanupAudioContext();
        };
    }, [cleanupAudioContext]);

    // Handle Previous Video
    const handlePrevVideo = useCallback(() => {
        // Pause current video before switching
        const currentVideo = document.querySelector('.video-card.active video');
        if (currentVideo && !currentVideo.paused) {
            currentVideo.pause();
        }
        
        const prevIndex = (currentVideoIndex - 1 + videoData.length) % videoData.length;
        setCurrentVideoIndex(prevIndex);

        if (isMobile && 'vibrate' in navigator) {
            navigator.vibrate([80, 40, 120]);
        }
    }, [currentVideoIndex, isMobile]);

    // Handle Next Video
    const handleNextVideo = useCallback(() => {
        // Pause current video before switching
        const currentVideo = document.querySelector('.video-card.active video');
        if (currentVideo && !currentVideo.paused) {
            currentVideo.pause();
        }
        
        const nextIndex = (currentVideoIndex + 1) % videoData.length;
        setCurrentVideoIndex(nextIndex);

        if (isMobile && 'vibrate' in navigator) {
            navigator.vibrate([120, 40, 80]);
        }
    }, [currentVideoIndex, isMobile]);

    // Handle Install Prompt
    const handleInstallClick = () => {
        setShowInstallPrompt(false);

        if (deferredPromptRef.current) {
            deferredPromptRef.current.prompt();
            deferredPromptRef.current.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPromptRef.current = null;
            });
        }
    };

    // Handle Close Install Prompt
    const handleCloseInstallPrompt = () => {
        setShowInstallPrompt(false);
        setInstallPromptDismissed(true);
        localStorage.setItem('installPromptDismissed', 'true');

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        localStorage.setItem('installPromptExpiry', expiryDate.toISOString());
    };

    // Check if prompt should be shown again after expiry
    useEffect(() => {
        const expiryDateStr = localStorage.getItem('installPromptExpiry');
        if (expiryDateStr) {
            const expiryDate = new Date(expiryDateStr);
            const currentDate = new Date();

            if (currentDate > expiryDate) {
                localStorage.removeItem('installPromptDismissed');
                localStorage.removeItem('installPromptExpiry');
                setInstallPromptDismissed(false);
            }
        }
    }, []);

    // Touch swipe handlers
    useEffect(() => {
        let touchStartY = 0;
        let touchEndY = 0;

        const handleTouchStart = (e) => {
            touchStartY = e.changedTouches[0].screenY;
        };

        const handleTouchEnd = (e) => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        };

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchStartY - touchEndY > swipeThreshold) {
                handleNextVideo();
            } else if (touchEndY - touchStartY > swipeThreshold) {
                handlePrevVideo();
            }
        };

        if (isMobile) {
            document.addEventListener('touchstart', handleTouchStart, false);
            document.addEventListener('touchend', handleTouchEnd, false);
        }

        return () => {
            document.removeEventListener('touchstart', handleTouchStart, false);
            document.removeEventListener('touchend', handleTouchEnd, false);
        };
    }, [isMobile, handleNextVideo, handlePrevVideo]);

    // Disable pull-to-refresh on mobile
    useEffect(() => {
        if (!isMobile) return;

        const appElement = document.querySelector('.App');
        if (!appElement) return;

        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].screenY;
        };

        const handleTouchMove = (e) => {
            if (appElement.scrollTop === 0 && e.touches[0].screenY > touchStartY) {
                e.preventDefault();
            }
        };

        appElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        appElement.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            if (appElement) {
                appElement.removeEventListener('touchstart', handleTouchStart);
                appElement.removeEventListener('touchmove', handleTouchMove);
            }
        };
    }, [isMobile]);

    // Easter Egg Function
    const activateEasterEgg = useCallback(() => {
        const newState = !easterEggActive;
        setEasterEggActive(newState);

        if (isMobile && 'vibrate' in navigator) {
            if (newState) {
                navigator.vibrate([50, 30, 70, 30, 100, 30, 150, 30, 200]);
            } else {
                navigator.vibrate([200, 50, 150, 50, 100, 50, 70, 50, 50]);
            }
        }

        if (newState) {
            const easterEggMessage = document.createElement('div');
            easterEggMessage.style.position = 'fixed';
            easterEggMessage.style.top = '10%';
            easterEggMessage.style.left = '50%';
            easterEggMessage.style.transform = 'translateX(-50%)';
            easterEggMessage.style.color = 'white';
            easterEggMessage.style.background = 'rgba(0,0,0,0.7)';
            easterEggMessage.style.padding = '20px';
            easterEggMessage.style.borderRadius = '10px';
            easterEggMessage.style.zIndex = '1000';
            easterEggMessage.style.fontSize = '20px';
            easterEggMessage.style.fontWeight = 'bold';
            easterEggMessage.style.textAlign = 'center';
            easterEggMessage.style.boxShadow = '0 0 20px var(--neon-pink)';
            easterEggMessage.innerHTML = '🏎️ Turbo Mode Activated! 🏎️<br>Life is too short to drive slowly.';

            document.body.appendChild(easterEggMessage);

            setTimeout(() => {
                if (document.body.contains(easterEggMessage)) {
                    document.body.removeChild(easterEggMessage);
                }
            }, 3000);
        }
    }, [easterEggActive, isMobile]);

    // Konami Code Handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === konamiCodeSequence[konamiCodePosition]) {
                const newPosition = konamiCodePosition + 1;
                setKonamiCodePosition(newPosition);

                if (newPosition === konamiCodeSequence.length) {
                    activateEasterEgg();
                    setKonamiCodePosition(0);
                }
            } else {
                setKonamiCodePosition(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [konamiCodePosition, konamiCodeSequence, activateEasterEgg]);

    // Handle first user interaction
    useEffect(() => {
        const handleUserInteraction = () => {
            if (hasUserInteracted.current) return;
            
            hasUserInteracted.current = true;
            setAutoplayEnabled(true);

            if (isMobile && 'vibrate' in navigator) {
                navigator.vibrate([100, 50, 150]);
            }

            // Setup audio context after user interaction
            setTimeout(() => {
                setupAudioAnalyzer();
            }, 500);

            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, [isMobile, setupAudioAnalyzer]);

    return (
        <div className={`App ${easterEggActive ? 'easter-egg-active' : ''}`}>
            <BackgroundAnimation />

            <div className="video-wall">
                {videoData.map((data, index) => (
                    <VideoCard
                        key={`video-${index}`} // More specific key
                        videoData={videoData}
                        index={index}
                        currentVideoIndex={currentVideoIndex}
                        setCurrentVideoIndex={setCurrentVideoIndex}
                        isMobile={isMobile}
                        autoplayEnabled={autoplayEnabled}
                        globalPlayingState={globalPlayingState}
                        onVideoStateChange={handleVideoStateChange}
                        hasUserInteracted={hasUserInteracted.current}
                    />
                ))}
            </div>
            
            {isMobile && showInstallPrompt && !installPromptDismissed && (
                <div className="install-prompt">
                    <div className="install-prompt-content">
                        <span className="emoji-funk">🚀</span>
                        <span className="emoji-funk">✨</span>
                        <span className="emoji-funk">🔥</span>

                        <div className="install-prompt-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v12M19 9l-7 7-7-7" />
                                <rect x="5" y="15" width="14" height="7" rx="2" />
                            </svg>
                        </div>
                        <div className="install-prompt-text">
                            <h3>Add to Home Screen</h3>
                            <p>Get the full experience with our app!</p>
                        </div>
                        <div className="install-prompt-actions">
                            <button className="install-btn" onClick={handleInstallClick}>Install Now</button>
                            <button className="close-btn" onClick={handleCloseInstallPrompt}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EasterEggButton activateEasterEgg={activateEasterEgg} />
        </div>
    );
}

export default App;