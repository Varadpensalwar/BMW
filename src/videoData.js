// src/videoData.js
// Fisher-Yates (Knuth) shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid modifying the original
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Original video data
const originalVideoData = [
  { src: 'videos/1.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/2.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/3.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/4.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/5.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/6.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/7.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/8.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/9.mp4',  model: 'Porsche 911 GT3 RS' },
  { src: 'videos/10.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/11.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/12.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/13.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/14.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/15.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/16.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/17.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/18.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/19.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/20.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/21.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/22.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/23.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/24.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/25.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/26.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/27.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/28.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/29.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/30.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/31.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/32.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/33.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/34.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/35.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/36.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/37.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/38.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/39.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/40.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/41.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/42.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/43.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/44.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/45.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/46.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/47.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/48.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/49.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/50.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/51.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/52.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/53.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/54.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/55.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/56.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/57.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/58.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/59.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/60.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/61.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/62.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/63.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/64.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/65.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/66.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/67.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/68.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/69.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/70.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/71.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/72.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/73.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/74.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/75.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/76.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/77.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/78.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/79.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/80.mp4', model: 'Porsche 911 GT3 RS' },
  { src: 'videos/81.mp4', model: 'Porsche 911 GT3 RS' }

];

// Shuffle the videos every time this module is loaded (on page refresh/load)
const videoData = shuffleArray(originalVideoData);

export default videoData;