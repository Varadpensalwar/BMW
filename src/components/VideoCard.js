// src/components/VideoCard.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// Move vibration patterns outside component to avoid dependency issues
const vibrationPatterns = {
    play: [50, 20, 70, 20, 90],
    pause: [90, 20, 70, 20, 50],
    scroll: [40, 10, 60, 10, 80, 10, 100, 15, 120, 15, 100, 10, 80, 10, 60, 10, 40],
    fullVibration: [200, 50, 250, 50, 300, 100, 250, 50, 200, 50, 150, 25, 100],
    bassHit: [120, 40, 80],
    drumBeat: [60, 15, 90, 15, 60],
    intense: [80, 20, 100, 20, 120, 30, 100, 20, 80],
    buildUp: [40, 10, 50, 10, 60, 10, 70, 10, 80, 10, 90, 10, 100],
    default: [60, 30, 60]
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
    
    // Vibration function
    const triggerVibration = useCallback((type = 'default') => {
        if (isMobile && 'vibrate' in navigator) {
            try {
                const pattern = vibrationPatterns[type] || vibrationPatterns.default;
                navigator.vibrate(pattern);
            } catch (error) {
                console.log('Vibration not supported or failed:', error);
            }
        }
    }, [isMobile]);

    // Expose vibration functions globally
    useEffect(() => {
        window.triggerScrollVibration = () => triggerVibration('scroll');
        window.triggerFullVibration = () => triggerVibration('fullVibration');
    }, [triggerVibration]);

    // Audio analysis
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

            const bassAvg = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
            const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
            const highAvg = highRange.reduce((sum, val) => sum + val, 0) / highRange.length;

            const overallIntensity = (bassAvg + midAvg + highAvg) / 3 / 255;
            const intensityChange = Math.abs(overallIntensity - lastIntensityRef.current);
            
            if (overallIntensity > intensityThresholdRef.current && intensityChange > 0.3) {
                triggerVibration('intense');
            }

            if (bassAvg > 180 && intensityChange > 0.4) {
                triggerVibration('bassHit');
            }

            if (highAvg > 150 && intensityChange > 0.3) {
                triggerVibration('drumBeat');
            }

            if (overallIntensity > lastIntensityRef.current + 0.1 && overallIntensity > 0.5) {
                triggerVibration('buildUp');
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

    // Video event handlers
    const handleLoadedData = useCallback(() => {
        setCanPlay(true);
    }, []);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
        triggerVibration('play');
        if (intensityVibrationEnabled) {
            setupAudioAnalysis();
        }
    }, [triggerVibration, intensityVibrationEnabled, setupAudioAnalysis]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
        triggerVibration('pause');
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, [triggerVibration]);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        if (progressRef.current) {
            progressRef.current.style.width = '0%';
        }
        
        if (autoplayEnabled) {
            setTimeout(() => {
                const nextIndex = (index + 1) % videoData.length;
                setCurrentVideoIndex(nextIndex);
            }, 500);
        }
    }, [autoplayEnabled, index, videoData.length, setCurrentVideoIndex]);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        const progressBar = progressRef.current;
        
        if (video && progressBar && video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }, []);

    // Play/pause video function
    const togglePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !canPlay) return;

        try {
            if (video.paused || video.ended) {
                if (video.ended) {
                    video.currentTime = 0;
                }
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            console.error('Video play/pause error:', error);
        }
    }, [canPlay]);

    // Handle card click
    const handleCardClick = useCallback((e) => {
        e.preventDefault();
        
        if (isActive) {
            togglePlayPause();
        } else {
            setCurrentVideoIndex(index);
        }
    }, [isActive, togglePlayPause, setCurrentVideoIndex, index]);

    // Load video when needed
    useEffect(() => {
        const video = videoRef.current;
        if (!video || loaded) return;

        // Load current video and next video
        if (index === currentVideoIndex || index === (currentVideoIndex + 1) % videoData.length) {
            video.src = videoData[index].src;
            video.load();
            setLoaded(true);
        }
    }, [index, currentVideoIndex, videoData, loaded]);

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

    // Handle active card changes
    useEffect(() => {
        const video = videoRef.current;
        const card = cardRef.current;
        
        if (!video || !card) return;

        if (isActive) {
            // Activate card
            card.classList.add('active');
            
            if (isMobile) {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                gsap.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.5 });
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
    }, [isActive, loaded, autoplayEnabled, canPlay, isMobile, videoData, index, cleanupAudioAnalysis]);

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
                />
                <div className="card-overlay"></div>
                <div className="progress-bar" ref={progressRef}></div>
                <div className="model-info">{videoData[index].model}</div>
                
                {/* Play/Pause Button - Show when active and not playing */}
                {isActive && !isPlaying && (
                    <div className="play-pause-overlay show-controls">
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