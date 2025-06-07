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
  { src: 'videos/BMW_2.mp4',  model: 'BMW' },
  { src: 'videos/BMW_1.mp4',  model: 'BMW' },
  { src: 'videos/BMW_3.mp4',  model: 'BMW' },
  { src: 'videos/BMW_4.mp4',  model: 'BMW' },
  { src: 'videos/BMW_5.mp4',  model: 'BMW' },
  { src: 'videos/BMW_6.mp4',  model: 'BMW' },
  { src: 'videos/BMW_7.mp4',  model: 'BMW' },
  { src: 'videos/BMW_8.mp4',  model: 'BMW' },
  { src: 'videos/BMW_9.mp4',  model: 'BMW' },
  { src: 'videos/BMW_10.mp4', model: 'BMW' },
  { src: 'videos/BMW_11.mp4', model: 'BMW' },
  { src: 'videos/BMW_12.mp4', model: 'BMW' },
  { src: 'videos/BMW_13.mp4', model: 'BMW' },
  { src: 'videos/BMW_14.mp4', model: 'BMW' },
  { src: 'videos/BMW_15.mp4', model: 'BMW' },
  { src: 'videos/BMW_16.mp4', model: 'BMW' },
  { src: 'videos/BMW_17.mp4', model: 'BMW' },
  { src: 'videos/BMW_18.mp4', model: 'BMW' },
  { src: 'videos/BMW_19.mp4', model: 'BMW' },
  { src: 'videos/BMW_20.mp4', model: 'BMW' },
  { src: 'videos/BMW_21.mp4', model: 'BMW' },
  { src: 'videos/BMW_22.mp4', model: 'BMW' },
  { src: 'videos/BMW_23.mp4', model: 'BMW' },
  { src: 'videos/BMW_24.mp4', model: 'BMW' },
  { src: 'videos/BMW_25.mp4', model: 'BMW' },
  { src: 'videos/BMW_26.mp4', model: 'BMW' },
  { src: 'videos/BMW_27.mp4', model: 'BMW' },
  { src: 'videos/BMW_28.mp4', model: 'BMW' },
  { src: 'videos/BMW_29.mp4', model: 'BMW' },
  { src: 'videos/BMW_30.mp4', model: 'BMW' },
  { src: 'videos/BMW_31.mp4', model: 'BMW' },
  { src: 'videos/BMW_32.mp4', model: 'BMW' },
  { src: 'videos/BMW_33.mp4', model: 'BMW' },
  { src: 'videos/BMW_34.mp4', model: 'BMW' },
  { src: 'videos/BMW_35.mp4', model: 'BMW' },
  { src: 'videos/BMW_36.mp4', model: 'BMW' },
  { src: 'videos/BMW_37.mp4', model: 'BMW' },
  { src: 'videos/BMW_38.mp4', model: 'BMW' },
  { src: 'videos/BMW_39.mp4', model: 'BMW' },
  { src: 'videos/BMW_40.mp4', model: 'BMW' },
  { src: 'videos/BMW_41.mp4', model: 'BMW' },
  { src: 'videos/BMW_42.mp4', model: 'BMW' },
  { src: 'videos/BMW_43.mp4', model: 'BMW' },
  { src: 'videos/BMW_44.mp4', model: 'BMW' },
  { src: 'videos/BMW_45.mp4', model: 'BMW' },
  { src: 'videos/BMW_46.mp4', model: 'BMW' },
  { src: 'videos/BMW_47.mp4', model: 'BMW' },
  { src: 'videos/BMW_48.mp4', model: 'BMW' },
  { src: 'videos/BMW_49.mp4', model: 'BMW' },
  { src: 'videos/BMW_50.mp4', model: 'BMW' },
  { src: 'videos/BMW_51.mp4', model: 'BMW' },
  { src: 'videos/BMW_52.mp4', model: 'BMW' },
  { src: 'videos/BMW_53.mp4', model: 'BMW' },
  { src: 'videos/BMW_54.mp4', model: 'BMW' },
  { src: 'videos/BMW_55.mp4', model: 'BMW' },
  { src: 'videos/BMW_56.mp4', model: 'BMW' },
  { src: 'videos/BMW_57.mp4', model: 'BMW' },
  { src: 'videos/BMW_58.mp4', model: 'BMW' },
  { src: 'videos/BMW_59.mp4', model: 'BMW' },
  { src: 'videos/BMW_60.mp4', model: 'BMW' },
  { src: 'videos/BMW_61.mp4', model: 'BMW' },
  { src: 'videos/BMW_62.mp4', model: 'BMW' },
  { src: 'videos/BMW_63.mp4', model: 'BMW' },
  { src: 'videos/BMW_64.mp4', model: 'BMW' },
  { src: 'videos/BMW_65.mp4', model: 'BMW' }

];

// Shuffle the videos every time this module is loaded (on page refresh/load)
const videoData = shuffleArray(originalVideoData);

export default videoData;