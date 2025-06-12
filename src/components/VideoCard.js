// src/components/VideoCard.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

const VideoCard = ({ 
    videoData, 
    index, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    isMobile,
    autoplayEnabled,
    intensityVibrationEnabled = true // New prop to enable/disable intensity vibration
}) => {
    const cardRef = useRef(null);
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastIntensityRef = useRef(0);
    const intensityThresholdRef = useRef(0.7); // Adjust sensitivity (0.1 = very sensitive, 0.9 = less sensitive)
    
    const [loaded, setLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false); // Track if video has ever played
    
    // Check if this is the active card
    const isActive = currentVideoIndex === index;
    
    // Vibration function for mobile devices - Enhanced patterns
    const triggerVibration = useCallback((type = 'default') => {
        if (isMobile && 'vibrate' in navigator) {
            try {
                let pattern;
                switch (type) {
                    case 'play':
                        // Gentle ascending pulse for play
                        pattern = [50, 20, 70, 20, 90];
                        break;
                    case 'pause':
                        // Gentle descending pulse for pause
                        pattern = [90, 20, 70, 20, 50];
                        break;
                    case 'scroll':
                        // Long, rich scrolling vibration - full haptic experience
                        pattern = [40, 10, 60, 10, 80, 10, 100, 15, 120, 15, 100, 10, 80, 10, 60, 10, 40];
                        break;
                    case 'fullVibration':
                        // Maximum vibration experience
                        pattern = [200, 50, 250, 50, 300, 100, 250, 50, 200, 50, 150, 25, 100];
                        break;
                    case 'bassHit':
                        // Strong bass hit vibration
                        pattern = [120, 40, 80];
                        break;
                    case 'drumBeat':
                        // Sharp drum beat vibration
                        pattern = [60, 15, 90, 15, 60];
                        break;
                    case 'intense':
                        // Intense moment vibration
                        pattern = [80, 20, 100, 20, 120, 30, 100, 20, 80];
                        break;
                    case 'buildUp':
                        // Build-up vibration
                        pattern = [40, 10, 50, 10, 60, 10, 70, 10, 80, 10, 90, 10, 100];
                        break;
                    default:
                        // Default gentle pulse
                        pattern = [60, 30, 60];
                        break;
                }
                navigator.vibrate(pattern);
            } catch (error) {
                console.log('Vibration not supported or failed:', error);
            }
        }
    }, [isMobile]);

    // Analyze audio for intensity
    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        const analyze = () => {
            analyser.getByteFrequencyData(dataArray);

            // Calculate different frequency ranges
            const bassRange = dataArray.slice(0, 20); // Low frequencies (bass)
            const midRange = dataArray.slice(20, 100); // Mid frequencies
            const highRange = dataArray.slice(100, 200); // High frequencies

            // Calculate average intensity for each range
            const bassAvg = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length;
            const midAvg = midRange.reduce((sum, val) => sum + val, 0) / midRange.length;
            const highAvg = highRange.reduce((sum, val) => sum + val, 0) / highRange.length;

            // Calculate overall intensity
            const overallIntensity = (bassAvg + midAvg + highAvg) / 3 / 255;

            // Detect intensity changes
            const intensityChange = Math.abs(overallIntensity - lastIntensityRef.current);
            
            // Trigger vibrations based on audio characteristics
            if (overallIntensity > intensityThresholdRef.current) {
                // High intensity moment
                if (intensityChange > 0.3) {
                    triggerVibration('intense');
                }
            }

            // Detect bass hits
            if (bassAvg > 180 && intensityChange > 0.4) {
                triggerVibration('bassHit');
            }

            // Detect drum beats (high frequency spikes)
            if (highAvg > 150 && intensityChange > 0.3) {
                triggerVibration('drumBeat');
            }

            // Detect build-ups (gradual intensity increase)
            if (overallIntensity > lastIntensityRef.current + 0.1 && overallIntensity > 0.5) {
                triggerVibration('buildUp');
            }

            lastIntensityRef.current = overallIntensity;
            animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();
    }, [triggerVibration]);

    // Audio analysis for intensity detection
    const setupAudioAnalysis = useCallback(() => {
        const video = videoRef.current;
        if (!video || !intensityVibrationEnabled) return;

        try {
            // Clean up existing audio context first
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }

            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            // Create analyser
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            // Create data array
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            dataArrayRef.current = dataArray;

            // Check if video already has a source node connected
            if (!video.audioSourceConnected) {
                // Connect video to analyser
                const source = audioContext.createMediaElementSource(video);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                
                // Mark video as having audio source connected
                video.audioSourceConnected = true;
            }

            // Start analysis
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
    }, []);

    // Expose scroll vibration function to parent component
    window.triggerScrollVibration = () => triggerVibration('scroll');
    window.triggerFullVibration = () => triggerVibration('fullVibration');
    
    useEffect(() => {
        const video = videoRef.current;
        const card = cardRef.current;
        const progressBar = progressRef.current;
        
        // Function to update progress bar
        const updateProgress = () => {
            if (video && progressBar) {
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${progress}%`;
            }
        };
        
        // Function to handle video end
        const handleVideoEnd = () => {
            if (card) {
                setIsPlaying(false);
                setHasStartedPlaying(false); // Reset the playing state when video ends
                
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
                
                // Only advance if autoplay is enabled
                if (autoplayEnabled) {
                    setTimeout(() => {
                        const nextIndex = (index + 1) % videoData.length;
                        setCurrentVideoIndex(nextIndex);
                    }, 500);
                }
            }
        };
        
        // Function to handle play event
        const handlePlay = () => {
            setIsPlaying(true);
            setHasStartedPlaying(true);
            // Grok-style ascending pulse for play
            triggerVibration('play');
            // Start audio analysis when playing (only if not already connected)
            if (intensityVibrationEnabled && !video.audioAnalysisActive) {
                video.audioAnalysisActive = true;
                setupAudioAnalysis();
            }
        };
        
        // Function to handle pause event
        const handlePause = () => {
            setIsPlaying(false);
            // Grok-style descending pulse for pause
            triggerVibration('pause');
            // Stop audio analysis when paused
            if (video) {
                video.audioAnalysisActive = false;
            }
            cleanupAudioAnalysis();
        };
        
        // Set up event listeners
        if (video) {
            video.addEventListener('timeupdate', updateProgress);
            video.addEventListener('ended', handleVideoEnd);
            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);
            
            // Preload the video if it's the current one or the next one
            if (index === currentVideoIndex || index === (currentVideoIndex + 1) % videoData.length) {
                if (!loaded) {
                    video.src = videoData[index].src;
                    video.load();
                    setLoaded(true);
                }
            }
        }
        
        return () => {
            if (video) {
                video.removeEventListener('timeupdate', updateProgress);
                video.removeEventListener('ended', handleVideoEnd);
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
            }
        };
    }, [index, currentVideoIndex, videoData, isMobile, loaded, autoplayEnabled, setCurrentVideoIndex, triggerVibration, setupAudioAnalysis, cleanupAudioAnalysis, intensityVibrationEnabled]);
    
    // Handle when this card becomes active
    useEffect(() => {
        const video = videoRef.current;
        const card = cardRef.current;
        
        if (isActive && card && video) {
            // Make the card active
            card.classList.add('active');
            
            if (isMobile) {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                
                gsap.fromTo(card, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.5 }
                );
            }
            
            // Ensure video has loaded
            if (!loaded) {
                video.src = videoData[index].src;
                video.load();
                setLoaded(true);
            }
            
            // Play the video if autoplay is enabled AND this video hasn't been played before
            // OR if the video ended and we're coming back to it
            if (autoplayEnabled && (!hasStartedPlaying || video.ended)) {
                video.currentTime = 0;
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Video playback error:', error);
                    });
                }
            }
        } else if (!isActive && card) {
            // Remove active state
            card.classList.remove('active');
            
            if (isMobile) {
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            }
            
            // Pause the video if it's playing
            if (video && !video.paused) {
                video.pause();
                setIsPlaying(false);
                // Clean up audio analysis when switching away
                video.audioAnalysisActive = false;
                cleanupAudioAnalysis();
            }
        }
    }, [isActive, index, videoData, isMobile, loaded, autoplayEnabled, hasStartedPlaying, cleanupAudioAnalysis]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupAudioAnalysis();
        };
    }, [cleanupAudioAnalysis]);
    
    // Handle click on video card
    const handleCardClick = (e) => {
        // Prevent default behavior
        e.preventDefault();
        
        const video = videoRef.current;
        
        if (isActive && video) {
            // Toggle play/pause for the active video
            if (video.paused || video.ended) {
                // If video ended, reset to beginning
                if (video.ended) {
                    video.currentTime = 0;
                    setHasStartedPlaying(false);
                }
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsPlaying(true);
                        setHasStartedPlaying(true);
                        // Vibration is handled by the play event listener
                    }).catch(error => {
                        console.error('Video playback error:', error);
                    });
                }
            } else {
                video.pause();
                setIsPlaying(false);
                // Vibration is handled by the pause event listener
            }
        } else {
            // Switch to this card
            setCurrentVideoIndex(index);
        }
    };
    
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
                
                {/* Play/Pause Button Overlay - Show when active AND (not playing OR video ended) */}
                {isActive && (!isPlaying || videoRef.current?.ended) && (
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