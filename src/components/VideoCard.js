// src/components/VideoCard.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// Enhanced vibration patterns for comprehensive mobile feedback
const vibrationPatterns = {
    // Video control vibrations
    play: [80, 30, 120, 30, 150],
    pause: [150, 30, 120, 30, 80],
    stop: [200, 50, 150, 50, 100],
    
    // Navigation vibrations
    scroll: [60, 15, 80, 15, 100, 20, 120, 20, 100, 15, 80, 15, 60],
    cardSwitch: [100, 40, 80, 20, 100, 40, 80],
    cardSelect: [120, 50, 80, 30, 120],
    
    // Touch feedback vibrations
    tapLight: [40, 20, 60],
    tapMedium: [80, 30, 100],
    tapStrong: [120, 40, 150, 40, 120],
    longPress: [200, 100, 150, 50, 100],
    
    // Audio-reactive vibrations
    bassHit: [150, 50, 100, 30, 80],
    drumBeat: [80, 20, 120, 20, 80, 20, 60],
    intense: [100, 25, 140, 25, 180, 40, 140, 25, 100],
    buildUp: [50, 15, 60, 15, 70, 15, 80, 15, 90, 15, 100, 15, 120],
    drop: [200, 80, 250, 80, 300, 120, 250, 80, 200],
    
    // System feedback vibrations
    loading: [60, 30, 80, 30, 100, 30, 80, 30, 60],
    success: [100, 50, 80, 30, 120, 50, 100],
    error: [200, 100, 150, 50, 200, 100, 150],
    warning: [120, 60, 100, 40, 120, 60, 100],
    
    // Special effect vibrations
    fullVibration: [250, 60, 300, 60, 350, 120, 300, 60, 250, 60, 200, 40, 150],
    powerPulse: [180, 70, 220, 70, 260, 100, 220, 70, 180],
    rhythmSync: [90, 25, 110, 25, 130, 30, 110, 25, 90],
    
    // Default fallbacks
    default: [80, 40, 80],
    subtle: [40, 20, 60, 20, 40],
    strong: [150, 60, 120, 40, 150]
};

const VideoCard = ({ 
    videoData, 
    index, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    isMobile,
    autoplayEnabled,
    intensityVibrationEnabled = true
}) => {
    const cardRef = useRef(null);
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastIntensityRef = useRef(0);
    const intensityThresholdRef = useRef(0.7);
    const audioSourceRef = useRef(null);
    
    const [loaded, setLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    
    // Check if this is the active card
    const isActive = currentVideoIndex === index;
    
    // Enhanced vibration function with intensity control
    const triggerVibration = useCallback((type = 'default', intensity = 1.0) => {
        if (isMobile && 'vibrate' in navigator) {
            try {
                let pattern = vibrationPatterns[type] || vibrationPatterns.default;
                
                // Apply intensity scaling (but keep within reasonable limits)
                if (intensity !== 1.0) {
                    pattern = pattern.map(duration => Math.min(Math.max(Math.round(duration * intensity), 10), 400));
                }
                
                navigator.vibrate(pattern);
            } catch (error) {
                console.log('Vibration not supported or failed:', error);
            }
        }
    }, [isMobile]);

    // Specialized vibration triggers
    const triggerTouchFeedback = useCallback((strength = 'medium') => {
        const feedbackMap = {
            light: 'tapLight',
            medium: 'tapMedium', 
            strong: 'tapStrong'
        };
        triggerVibration(feedbackMap[strength] || 'tapMedium');
    }, [triggerVibration]);

    const triggerLoadingVibration = useCallback(() => {
        triggerVibration('loading');
    }, [triggerVibration]);

    const triggerSuccessVibration = useCallback(() => {
        triggerVibration('success');
    }, [triggerVibration]);

    // Expose enhanced vibration functions globally
    useEffect(() => {
        window.triggerScrollVibration = () => triggerVibration('scroll');
        window.triggerFullVibration = () => triggerVibration('fullVibration');
        window.triggerPowerPulse = () => triggerVibration('powerPulse');
        window.triggerCardSwitch = () => triggerVibration('cardSwitch');
        window.triggerTouchFeedback = triggerTouchFeedback;
        window.triggerLoadingVibration = triggerLoadingVibration;
        window.triggerSuccessVibration = triggerSuccessVibration;
    }, [triggerVibration, triggerTouchFeedback, triggerLoadingVibration, triggerSuccessVibration]);

    // Enhanced audio analysis with more vibration triggers
    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current || !isPlaying) return;

        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        const analyze = () => {
            if (!isPlaying) return; // Stop if not playing
            
            analyser.getByteFrequencyData(dataArray);

            const bassRange = dataArray.slice(0, 20);
            const midRange = dataArray.slice(20, 100);
            const highRange = dataArray.slice(100, 200);
            const ultraHighRange = dataArray.slice(200, 255);

            const bassAvg = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
            const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
            const highAvg = highRange.reduce((sum, val) => sum + val, 0) / highRange.length;
            const ultraHighAvg = ultraHighRange.reduce((sum, val) => sum + val, 0) / ultraHighRange.length;

            const overallIntensity = (bassAvg + midAvg + highAvg) / 3 / 255;
            const intensityChange = Math.abs(overallIntensity - lastIntensityRef.current);
            
            // Enhanced vibration triggers based on audio analysis
            if (overallIntensity > 0.8 && intensityChange > 0.4) {
                triggerVibration('drop', 1.2); // Stronger vibration for drops
            } else if (overallIntensity > intensityThresholdRef.current && intensityChange > 0.3) {
                triggerVibration('intense');
            }

            // Bass-heavy sections
            if (bassAvg > 200 && intensityChange > 0.5) {
                triggerVibration('powerPulse', 1.1);
            } else if (bassAvg > 180 && intensityChange > 0.4) {
                triggerVibration('bassHit');
            }

            // High frequency hits (cymbals, snares)
            if (highAvg > 170 && intensityChange > 0.35) {
                triggerVibration('drumBeat', 0.8);
            }

            // Ultra-high frequency content
            if (ultraHighAvg > 120 && intensityChange > 0.25) {
                triggerVibration('subtle', 0.6);
            }

            // Build-up detection
            if (overallIntensity > lastIntensityRef.current + 0.15 && overallIntensity > 0.6) {
                triggerVibration('buildUp', 1.0);
            }

            // Rhythm sync for consistent beats
            if (bassAvg > 150 && midAvg > 120 && intensityChange > 0.2) {
                triggerVibration('rhythmSync', 0.9);
            }

            lastIntensityRef.current = overallIntensity;
            animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();
    }, [isPlaying, triggerVibration]);

    // Setup audio analysis
    const setupAudioAnalysis = useCallback(() => {
        const video = videoRef.current;
        if (!video || !intensityVibrationEnabled || audioContextRef.current) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.8;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Create media source only once per video element
            if (!audioSourceRef.current) {
                const source = audioContext.createMediaElementSource(video);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                audioSourceRef.current = source;
            }

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;

            analyzeAudio();
        } catch (error) {
            console.log('Audio analysis setup failed:', error);
        }
    }, [intensityVibrationEnabled, analyzeAudio]);

    // Cleanup audio analysis
    const cleanupAudioAnalysis = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioSourceRef.current = null;
    }, []);

    // Enhanced video event handlers with comprehensive vibration feedback
    const handleLoadedData = useCallback(() => {
        setCanPlay(true);
        if (isActive) {
            triggerSuccessVibration(); // Feedback when video is ready
        }
    }, [isActive, triggerSuccessVibration]);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
        triggerVibration('play', 1.1); // Slightly stronger play vibration
        if (intensityVibrationEnabled) {
            setupAudioAnalysis();
        }
    }, [triggerVibration, intensityVibrationEnabled, setupAudioAnalysis]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
        triggerVibration('pause', 1.1); // Slightly stronger pause vibration
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, [triggerVibration]);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        triggerVibration('stop'); // Different vibration for video end
        if (progressRef.current) {
            progressRef.current.style.width = '0%';
        }
        
        if (autoplayEnabled) {
            setTimeout(() => {
                const nextIndex = (index + 1) % videoData.length;
                setCurrentVideoIndex(nextIndex);
                triggerVibration('cardSwitch'); // Vibrate when auto-switching
            }, 500);
        }
    }, [autoplayEnabled, index, videoData.length, setCurrentVideoIndex, triggerVibration]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        const progressBar = progressRef.current;
        
        if (video && progressBar && video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Optional: Vibrate at key progress points (25%, 50%, 75%)
            const progressInt = Math.floor(progress);
            if (isActive && isMobile && (progressInt === 25 || progressInt === 50 || progressInt === 75)) {
                // Store last progress point to avoid repeated vibrations
                if (!video.lastProgressVibration || video.lastProgressVibration !== progressInt) {
                    triggerVibration('subtle', 0.5);
                    video.lastProgressVibration = progressInt;
                }
            }
        }
    }, [isActive, isMobile, triggerVibration]);

    // Enhanced play/pause with error handling vibration
    const togglePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !canPlay) return;

        // Touch feedback for interaction
        triggerTouchFeedback('medium');

        try {
            if (video.paused || video.ended) {
                if (video.ended) {
                    video.currentTime = 0;
                }
                await video.play();
                // Success vibration handled by handlePlay
            } else {
                video.pause();
                // Pause vibration handled by handlePause
            }
        } catch (error) {
            console.error('Video play/pause error:', error);
            triggerVibration('error'); // Error feedback
        }
    }, [canPlay, triggerTouchFeedback, triggerVibration]);

    // Enhanced card click with comprehensive feedback
    const handleCardClick = useCallback((e) => {
        e.preventDefault();
        
        // Immediate touch feedback
        triggerTouchFeedback('strong');
        
        if (isActive) {
            togglePlayPause();
        } else {
            setCurrentVideoIndex(index);
            triggerVibration('cardSelect'); // Card selection feedback
        }
    }, [isActive, togglePlayPause, setCurrentVideoIndex, index, triggerTouchFeedback, triggerVibration]);

    // Enhanced video loading with feedback
    useEffect(() => {
        const video = videoRef.current;
        if (!video || loaded) return;

        // Load current video and next video
        if (index === currentVideoIndex || index === (currentVideoIndex + 1) % videoData.length) {
            // Loading feedback
            if (index === currentVideoIndex) {
                triggerLoadingVibration();
            }
            
            video.src = videoData[index].src;
            video.load();
            setLoaded(true);
        }
    }, [index, currentVideoIndex, videoData, loaded, triggerLoadingVibration]);

    // Setup video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [handleLoadedData, handlePlay, handlePause, handleEnded, handleTimeUpdate]);

    // Enhanced active card changes with transition feedback
    useEffect(() => {
        const video = videoRef.current;
        const card = cardRef.current;
        
        if (!video || !card) return;

        if (isActive) {
            // Activate card with feedback
            card.classList.add('active');
            triggerVibration('cardSwitch', 1.2); // Strong feedback for card activation
            
            if (isMobile) {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                gsap.fromTo(card, { opacity: 0 }, { 
                    opacity: 1, 
                    duration: 0.5,
                    onComplete: () => {
                        // Completion vibration
                        triggerVibration('success', 0.8);
                    }
                });
            }

            // Ensure video is loaded
            if (!loaded) {
                video.src = videoData[index].src;
                video.load();
                setLoaded(true);
            }

            // Auto-play if enabled
            if (autoplayEnabled && canPlay) {
                video.currentTime = 0;
                video.play().catch(error => {
                    console.error('Auto-play failed:', error);
                    triggerVibration('warning'); // Auto-play failed feedback
                });
            }
        } else {
            // Deactivate card
            card.classList.remove('active');
            
            if (isMobile) {
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            }

            // Pause video and cleanup
            if (!video.paused) {
                video.pause();
            }
            setIsPlaying(false);
            cleanupAudioAnalysis();
        }
    }, [isActive, loaded, autoplayEnabled, canPlay, isMobile, videoData, index, cleanupAudioAnalysis, triggerVibration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAudioAnalysis();
        };
    }, [cleanupAudioAnalysis]);
    
    return (
        <div 
            className={`video-card ${isActive ? 'active' : ''}`}
            ref={cardRef}
            onClick={handleCardClick}
            onTouchStart={() => isMobile && triggerTouchFeedback('light')} // Light touch feedback
            onMouseEnter={() => !isMobile && triggerVibration('subtle', 0.3)} // Subtle hover feedback
            style={{
                opacity: isMobile ? (isActive ? 1 : 0) : 1,
                visibility: isMobile ? (isActive ? 'visible' : 'hidden') : 'visible'
            }}
            data-index={index}
        >
            <div className="video-wrapper">
                <video 
                    ref={videoRef}
                    playsInline
                    preload="none"
                    onLoadStart={() => isActive && triggerVibration('loading', 0.6)}
                    onError={() => triggerVibration('error')}
                />
                <div className="card-overlay"></div>
                <div className="progress-bar" ref={progressRef}></div>
                <div className="model-info">{videoData[index].model}</div>
                
                {/* Enhanced Play/Pause Button with touch feedback */}
                {isActive && !isPlaying && (
                    <div 
                        className="play-pause-overlay show-controls"
                        onTouchStart={() => isMobile && triggerTouchFeedback('strong')}
                    >
                        <div className="play-pause-button">
                            <svg viewBox="0 0 24 24" width="100%" height="100%">
                                <path d="M8 5v14l11-7z" fill="white" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCard;