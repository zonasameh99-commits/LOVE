/* ============================================================
   CUSTOMIZE EVERYTHING HERE — no other file needs editing.
   ============================================================ */
window.CONFIG = {
  pin: "1234",                       // Secret PIN (digits only, 3-8 digits)
  pinHint: "Hint: our special day (DDMM)",  // Shown under the keypad. "" to hide.
  herName: "My Love",                // Name shown on the welcome screen
  fromName: "Me",
  siteTitle: "A Little Surprise For You",
  welcomeLine: "I made something special, just for you.",

  startDate: "2024-02-14",           // The day your story began (YYYY-MM-DD)
  specialDate: {                     // Next big day. If it is in the past, the
    label: "Our Anniversary",        // countdown rolls to the same day next year.
    date: "2027-02-14T00:00:00"
  },

  music: {
    src: "assets/audio/our-song.mp3", // Put YOUR audio file here (mp3/ogg/m4a)
    title: "Our Song",
    artist: "Played just for you"
  },

  // Replace the files in assets/photos or point to your own paths. Missing
  // files automatically show a pretty placeholder. Add/remove entries freely.
  photos: [
    { src: "assets/photos/photo1.svg", caption: "The day we met" },
    { src: "assets/photos/photo2.svg", caption: "Our first trip" },
    { src: "assets/photos/photo3.svg", caption: "That silly laugh" },
    { src: "assets/photos/photo4.svg", caption: "Late night talks" },
    { src: "assets/photos/photo5.svg", caption: "Coffee dates" },
    { src: "assets/photos/photo6.svg", caption: "Every moment with you" }
  ],

  gift: {
    boxLabel: "Tap your gift",
    title: "A Promise Just For You",
    message: "One evening planned entirely by me — dinner, flowers, and your favorite songs. You choose the date. 💝",
    buttonText: "Claim it ♡"
  },

  letter: {
    title: "My Dearest,",
    paragraphs: [
      "Every day with you feels like a gentle spring morning — soft, warm, and full of tiny miracles.",
      "You turn ordinary moments into memories I want to keep forever. Thank you for your laughter, your patience, and for being exactly who you are.",
      "Replace this text in js/config.js with your own heartfelt words. Say the things your heart has been keeping quiet."
    ],
    signature: "Forever yours,"
  }
};
