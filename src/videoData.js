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
  { src: 'BMW_1.mp4',  model: 'BMW' },
  { src: 'BMW_2.mp4',  model: 'BMW' },
  { src: 'BMW_3.mp4',  model: 'BMW' },
  { src: 'BMW_4.mp4',  model: 'BMW' },
  { src: 'BMW_5.mp4',  model: 'BMW' },
  { src: 'BMW_6.mp4',  model: 'BMW' },
  { src: 'BMW_7.mp4',  model: 'BMW' },
  { src: 'BMW_8.mp4',  model: 'BMW' },
  { src: 'BMW_9.mp4',  model: 'BMW' },
  { src: 'BMW_10.mp4', model: 'BMW' },
  { src: 'BMW_11.mp4', model: 'BMW' },
  { src: 'BMW_12.mp4', model: 'BMW' },
  { src: 'BMW_13.mp4', model: 'BMW' },
  { src: 'BMW_14.mp4', model: 'BMW' },
  { src: 'BMW_15.mp4', model: 'BMW' },
  { src: 'BMW_16.mp4', model: 'BMW' },
  { src: 'BMW_17.mp4', model: 'BMW' },
  { src: 'BMW_18.mp4', model: 'BMW' },
  { src: 'BMW_19.mp4', model: 'BMW' },
  { src: 'BMW_20.mp4', model: 'BMW' },
  { src: 'BMW_21.mp4', model: 'BMW' },
  { src: 'BMW_22.mp4', model: 'BMW' },
  { src: 'BMW_23.mp4', model: 'BMW' },
  { src: 'BMW_24.mp4', model: 'BMW' },
  { src: 'BMW_25.mp4', model: 'BMW' },
  { src: 'BMW_26.mp4', model: 'BMW' },
  { src: 'BMW_27.mp4', model: 'BMW' },
  { src: 'BMW_28.mp4', model: 'BMW' },
  { src: 'BMW_29.mp4', model: 'BMW' },
  { src: 'BMW_30.mp4', model: 'BMW' },
  { src: 'BMW_31.mp4', model: 'BMW' },
  { src: 'BMW_32.mp4', model: 'BMW' },
  { src: 'BMW_33.mp4', model: 'BMW' },
  { src: 'BMW_34.mp4', model: 'BMW' },
  { src: 'BMW_35.mp4', model: 'BMW' },
  { src: 'BMW_36.mp4', model: 'BMW' },
  { src: 'BMW_37.mp4', model: 'BMW' },
  { src: 'BMW_38.mp4', model: 'BMW' },
  { src: 'BMW_39.mp4', model: 'BMW' },
  { src: 'BMW_40.mp4', model: 'BMW' },
  { src: 'BMW_41.mp4', model: 'BMW' },
  { src: 'BMW_42.mp4', model: 'BMW' },
  { src: 'BMW_43.mp4', model: 'BMW' },
  { src: 'BMW_44.mp4', model: 'BMW' },
  { src: 'BMW_45.mp4', model: 'BMW' },
  { src: 'BMW_46.mp4', model: 'BMW' },
  { src: 'BMW_47.mp4', model: 'BMW' },
  { src: 'BMW_48.mp4', model: 'BMW' },
  { src: 'BMW_49.mp4', model: 'BMW' },
  { src: 'BMW_50.mp4', model: 'BMW' },
  { src: 'BMW_51.mp4', model: 'BMW' },
  { src: 'BMW_52.mp4', model: 'BMW' },
  { src: 'BMW_53.mp4', model: 'BMW' },
  { src: 'BMW_54.mp4', model: 'BMW' },
  { src: 'BMW_55.mp4', model: 'BMW' },
  { src: 'BMW_56.mp4', model: 'BMW' },
  { src: 'BMW_57.mp4', model: 'BMW' },
  { src: 'BMW_58.mp4', model: 'BMW' },
  { src: 'BMW_59.mp4', model: 'BMW' },
  { src: 'BMW_60.mp4', model: 'BMW' },
  { src: 'BMW_61.mp4', model: 'BMW' },
  { src: 'BMW_62.mp4', model: 'BMW' },
  { src: 'BMW_63.mp4', model: 'BMW' },
  { src: 'BMW_64.mp4', model: 'BMW' },
  { src: 'BMW_65.mp4', model: 'BMW' }

];

// Shuffle the videos every time this module is loaded (on page refresh/load)
const videoData = shuffleArray(originalVideoData);

export default videoData;