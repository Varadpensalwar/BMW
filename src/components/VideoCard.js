// src/components/VideoCard.js
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const VideoCard = ({ 
    videoData, 
    index, 
    currentVideoIndex, 
    setCurrentVideoIndex, 
    isMobile,
    autoplayEnabled
}) => {
    const cardRef = useRef(null);
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Check if this is the active card
    const isActive = currentVideoIndex === index;
    
    // Vibration function for mobile devices
    const triggerVibration = (pattern = [50]) => {
        if (isMobile && 'vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                console.log('Vibration not supported or failed:', error);
            }
        }
    };
    
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
                card.classList.remove('active');
                setIsPlaying(false);
                
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
                
                if (isMobile) {
                    card.style.opacity = '0';
                    card.style.visibility = 'hidden';
                    // Subtle vibration when video ends
                    triggerVibration([30]);
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
            // Vibrate on play (short vibration)
            triggerVibration([40]);
        };
        
        // Function to handle pause event
        const handlePause = () => {
            setIsPlaying(false);
            // Vibrate on pause (double tap pattern)
            triggerVibration([30, 50, 30]);
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
    }, [index, currentVideoIndex, videoData, isMobile, loaded, autoplayEnabled, setCurrentVideoIndex]);
    
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
                
                // Gentle vibration when card becomes active
                triggerVibration([25]);
            }
            
            // Ensure video has loaded
            if (!loaded) {
                video.src = videoData[index].src;
                video.load();
                setLoaded(true);
            }
            
            // Play the video if autoplay is enabled
            if (autoplayEnabled) {
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
            setIsPlaying(false);
            
            if (isMobile) {
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            }
            
            // Pause the video if it's playing
            if (video && !video.paused) {
                video.pause();
            }
        }
    }, [isActive, index, videoData, isMobile, loaded, autoplayEnabled]);
    
    // Handle mouse enter/leave for controls - not needed anymore since we only show controls when paused
    const handleMouseEnter = () => {
        // Controls visibility now depends only on play state
    };
    
    const handleMouseLeave = () => {
        // Controls visibility now depends only on play state
    };
    
    // Handle click on video card
    const handleCardClick = (e) => {
        // Prevent default behavior
        e.preventDefault();
        
        const video = videoRef.current;
        
        if (isActive && video) {
            // Toggle play/pause for the active video
            if (video.paused) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsPlaying(true);
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
        } else if (!isMobile) {
            // Switch to this card if not on mobile
            setCurrentVideoIndex(index);
        } else {
            // On mobile, switching cards also gets a vibration
            triggerVibration([35]);
            setCurrentVideoIndex(index);
        }
    };
    
    return (
        <div 
            className={`video-card ${isActive ? 'active' : ''}`}
            ref={cardRef}
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                
                {/* Play/Pause Button Overlay - Only show when active AND not playing */}
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