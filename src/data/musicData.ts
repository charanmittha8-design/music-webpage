import { Song, QuickMix } from '../types';

export const QUICK_MIXES: QuickMix[] = [
  {
    id: 'f-telugu-blockbusters',
    name: 'Pushpa 2 & Telugu Hits',
    query: 'Pushpa 2 Devara Telugu',
    emoji: '🎬',
    gradient: 'from-amber-600 to-red-700',
  },
  {
    id: 'f-bollywood-romance',
    name: 'Bollywood & Arijit Hits',
    query: 'Arijit Singh Bollywood Romance',
    emoji: '✨',
    gradient: 'from-rose-500 to-pink-700',
  },
  {
    id: 'f-party-mass',
    name: '🔥 Party & Mass Bangers',
    query: 'Indian Party Dance Mass Hits',
    emoji: '🎉',
    gradient: 'from-red-600 to-orange-600',
  },
  {
    id: 'f-sad-heartbreak',
    name: '💔 Sad & Heartbreak Melodies',
    query: 'Indian Sad Heartbreak Songs Arijit Sid Sriram',
    emoji: '🌧️',
    gradient: 'from-blue-700 to-indigo-900',
  },
  {
    id: 'f-tamil-mass',
    name: 'Tamil Rockstars (Anirudh)',
    query: 'Anirudh Ravichander Tamil Hits',
    emoji: '⚡',
    gradient: 'from-purple-600 to-indigo-800',
  },
  {
    id: 'f-malayalam-grooves',
    name: 'Malayalam Vibes (Aavesham)',
    query: 'Aavesham Malayalam Hits Sushin Shyam',
    emoji: '🌴',
    gradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'f-punjabi-energy',
    name: 'Punjabi Bangers',
    query: 'Diljit Dosanjh Sidhu Moosewala Punjabi',
    emoji: '🥁',
    gradient: 'from-yellow-500 to-amber-700',
  },
  {
    id: 'f-desi-lofi',
    name: 'Desi Lo-Fi & Chill',
    query: 'Indian Lofi Chill Songs',
    emoji: '🌙',
    gradient: 'from-indigo-600 to-purple-900',
  },
];

export const GENRES = [
  { name: 'Telugu Blockbusters', query: 'Telugu Top Hits', icon: '🔥' },
  { name: 'Bollywood Top Hits', query: 'Bollywood Hits Hindi', icon: '✨' },
  { name: 'Party & Dance', query: 'Indian Dance Party Hits', icon: '🎉' },
  { name: 'Sad & Heartbreak', query: 'Sad Emotional Hindi Telugu Songs', icon: '💔' },
  { name: 'Tamil Mass Beats', query: 'Tamil Mass Hits', icon: '⚡' },
  { name: 'Malayalam Vibes', query: 'Malayalam Top Songs', icon: '🌴' },
  { name: 'Punjabi Energy', query: 'Punjabi Hit Songs', icon: '🥁' },
  { name: 'Romantic Melodies', query: 'Indian Love Romantic Songs', icon: '❤️' },
];

export const CURATED_TRACKS: Song[] = [
  // 🎬 TELUGU 2024-2025 PARTY & MASS BANGERS
  {
    id: 'iGlEUFsg',
    title: 'Pushpa Pushpa (From "Pushpa 2 The Rule")',
    artist: 'Devi Sri Prasad, Nakash Aziz & Deepak Blue',
    album: 'Pushpa 2 The Rule',
    duration: '4:16',
    durationSec: 256,
    coverUrl: 'https://c.saavncdn.com/366/Pushpa-2-The-Rule-Telugu-Telugu-2024-20241205211012-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/366/0377fc358eb812da5d44b215b4bebfb3_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/366/0377fc358eb812da5d44b215b4bebfb3_320.mp4') + '&title=Pushpa%20Pushpa&artist=Devi%20Sri%20Prasad',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'party',
    genre: 'Mass Party',
  },
  {
    id: 'xO_AK9q9',
    title: 'Kissik (From "Pushpa 2 The Rule")',
    artist: 'Devi Sri Prasad, Sublahshini & Sreeleela',
    album: 'Pushpa 2 The Rule',
    duration: '4:08',
    durationSec: 248,
    coverUrl: 'https://c.saavncdn.com/917/Tollywood-Heroines-Musical-Blockbusters-Telugu-2025-20251120161002-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4') + '&title=Kissik&artist=Devi%20Sri%20Prasad',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'party',
    genre: 'Item Dance',
  },
  {
    id: '0jQi4RJN',
    title: 'Peelings (From "Pushpa 2 The Rule")',
    artist: 'Devi Sri Prasad & Shankarr Babu Kandukoori',
    album: 'Pushpa 2 The Rule',
    duration: '4:07',
    durationSec: 247,
    coverUrl: 'https://c.saavncdn.com/915/Top-10-Dance-Dhamaka-Hits-Telugu-2025-20251014181041-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/915/338e5143057ba7dcd6c7bbbb1ce8bb89_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/915/338e5143057ba7dcd6c7bbbb1ce8bb89_320.mp4') + '&title=Peelings&artist=Devi%20Sri%20Prasad',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'party',
    genre: 'Folk Mass',
  },
  {
    id: 'kurchi-madathapetti',
    title: 'Kurchi Madathapetti (From "Guntur Kaaram")',
    artist: 'Thaman S, Sahithi Chaganti & Sri Krishna',
    album: 'Guntur Kaaram',
    duration: '3:38',
    durationSec: 218,
    coverUrl: 'https://c.saavncdn.com/480/Guntur-Kaaram-Telugu-2024-20240108191001-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/480/7e3dfddfe7ff49c693aeecc617f1a303_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/480/7e3dfddfe7ff49c693aeecc617f1a303_320.mp4') + '&title=Kurchi%20Madathapetti&artist=Thaman%20S',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'party',
    genre: 'Mass Beat',
  },
  {
    id: '-JkPBIE7',
    title: 'Naatu Naatu (From "RRR")',
    artist: 'Rahul Sipligunj & Kaala Bhairava',
    album: 'RRR (Original Soundtrack)',
    duration: '3:34',
    durationSec: 214,
    coverUrl: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/683/000ab54759049a8451ffcdc6412a0ef6_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/683/000ab54759049a8451ffcdc6412a0ef6_320.mp4') + '&title=Naatu%20Naatu&artist=Rahul%20Sipligunj',
    quality: '320kbps HD',
    year: '2022',
    language: 'Telugu',
    mood: 'party',
    genre: 'High Energy',
  },
  {
    id: 'QOaKBiVi',
    title: 'Oo Antava Oo Oo Antava',
    artist: 'Indravathi Chauhan & Devi Sri Prasad',
    album: 'Pushpa - The Rise',
    duration: '3:43',
    durationSec: 223,
    coverUrl: 'https://c.saavncdn.com/blob/056/Pushpa-The-Rise-Telugu-2021-20211216115409-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/000/c9ec0ef49f6ae298fa57d09a7c852189_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/000/c9ec0ef49f6ae298fa57d09a7c852189_320.mp4') + '&title=Oo%20Antava&artist=Indravathi%20Chauhan',
    quality: '320kbps HD',
    year: '2021',
    language: 'Telugu',
    mood: 'party',
    genre: 'Party Dance',
  },

  // 💔 TELUGU & HINDI SAD & HEARTBREAK / SOULFUL TRACKS
  {
    id: 'channa-mereya-adhm',
    title: 'Channa Mereya (From "Ae Dil Hai Mushkil")',
    artist: 'Arijit Singh & Pritam',
    album: 'Ae Dil Hai Mushkil',
    duration: '4:49',
    durationSec: 289,
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4') + '&title=Channa%20Mereya&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2016',
    language: 'Hindi',
    mood: 'sad',
    genre: 'Heartbreak Soul',
  },
  {
    id: 'agar-tum-saath-ho',
    title: 'Agar Tum Saath Ho (From "Tamasha")',
    artist: 'Arijit Singh, Alka Yagnik & A.R. Rahman',
    album: 'Tamasha',
    duration: '5:41',
    durationSec: 341,
    coverUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4') + '&title=Agar%20Tum%20Saath%20Ho&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2015',
    language: 'Hindi',
    mood: 'sad',
    genre: 'Emotional Ballad',
  },
  {
    id: 'tujhe-kitna-chahne-lage',
    title: 'Tujhe Kitna Chahne Lage (From "Kabir Singh")',
    artist: 'Arijit Singh & Mithoon',
    album: 'Kabir Singh',
    duration: '4:44',
    durationSec: 284,
    coverUrl: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230713180424-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4') + '&title=Tujhe%20Kitna%20Chahne%20Lage&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2019',
    language: 'Hindi',
    mood: 'sad',
    genre: 'Sad Romantic',
  },
  {
    id: 'priyathama-majili',
    title: 'Priyathama Priyathama (From "Majili")',
    artist: 'Chinmayi Sripada & Gopi Sundar',
    album: 'Majili',
    duration: '4:05',
    durationSec: 245,
    coverUrl: 'https://c.saavncdn.com/917/Tollywood-Heroines-Musical-Blockbusters-Telugu-2025-20251120161002-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4') + '&title=Priyathama%20Priyathama&artist=Chinmayi',
    quality: '320kbps HD',
    year: '2019',
    language: 'Telugu',
    mood: 'sad',
    genre: 'Soulful Melody',
  },
  {
    id: 'kallolam-padi-padi',
    title: 'Kallolam (From "Padi Padi Leche Manasu")',
    artist: 'Anurag Kulkarni & Vishal Chandrashekhar',
    album: 'Padi Padi Leche Manasu',
    duration: '4:15',
    durationSec: 255,
    coverUrl: 'https://c.saavncdn.com/888/Kalki-2898-Ad-Telugu-Telugu-2024-20240712063717-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4') + '&title=Kallolam&artist=Anurag%20Kulkarni',
    quality: '320kbps HD',
    year: '2018',
    language: 'Telugu',
    mood: 'sad',
    genre: 'Emotional Melody',
  },

  // ❤️ ROMANTIC & LOVE MELODIES
  {
    id: 'faloMmjX',
    title: 'Chaleya (From "Jawan")',
    artist: 'Arijit Singh, Shilpa Rao & Anirudh Ravichander',
    album: 'Jawan',
    duration: '3:20',
    durationSec: 200,
    coverUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4') + '&title=Chaleya&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2023',
    language: 'Hindi',
    mood: 'romantic',
    genre: 'Romantic Duet',
  },
  {
    id: 'rjkrTnma',
    title: 'Kesariya (From "Brahmastra")',
    artist: 'Arijit Singh, Pritam & Amitabh Bhattacharya',
    album: 'Brahmastra',
    duration: '4:28',
    durationSec: 268,
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4') + '&title=Kesariya&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2022',
    language: 'Hindi',
    mood: 'romantic',
    genre: 'Love Melody',
  },
  {
    id: 'O94kBTtw',
    title: 'Chuttamalle (From "Devara Part 1")',
    artist: 'Shilpa Rao & Anirudh Ravichander',
    album: 'Devara Part 1',
    duration: '3:42',
    durationSec: 222,
    coverUrl: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/313/e49e604945889f330e5b3536dd0ff524_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/313/e49e604945889f330e5b3536dd0ff524_320.mp4') + '&title=Chuttamalle&artist=Shilpa%20Rao',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'romantic',
    genre: 'Romantic Groove',
  },
  {
    id: 'samajavaragamana-alvp',
    title: 'Samajavaragamana (From "Ala Vaikunthapurramuloo")',
    artist: 'Sid Sriram & Thaman S',
    album: 'Ala Vaikunthapurramuloo',
    duration: '3:44',
    durationSec: 224,
    coverUrl: 'https://c.saavncdn.com/480/Guntur-Kaaram-Telugu-2024-20240108191001-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/480/7e3dfddfe7ff49c693aeecc617f1a303_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/480/7e3dfddfe7ff49c693aeecc617f1a303_320.mp4') + '&title=Samajavaragamana&artist=Sid%20Sriram',
    quality: '320kbps HD',
    year: '2020',
    language: 'Telugu',
    mood: 'romantic',
    genre: 'Carnatic Melody',
  },
  {
    id: 'apna-bana-le-bhediya',
    title: 'Apna Bana Le (From "Bhediya")',
    artist: 'Arijit Singh & Sachin-Jigar',
    album: 'Bhediya',
    duration: '4:21',
    durationSec: 261,
    coverUrl: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230713180424-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4') + '&title=Apna%20Bana%20Le&artist=Arijit%20Singh',
    quality: '320kbps HD',
    year: '2022',
    language: 'Hindi',
    mood: 'romantic',
    genre: 'Love Duet',
  },
  {
    id: 'HfNOoigd',
    title: 'Ta Takkara (From "Kalki 2898 AD")',
    artist: 'Santhosh Narayanan, Sanjith Hegde & Dhee',
    album: 'Kalki 2898 AD',
    duration: '3:27',
    durationSec: 207,
    coverUrl: 'https://c.saavncdn.com/888/Kalki-2898-Ad-Telugu-Telugu-2024-20240712063717-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4') + '&title=Ta%20Takkara&artist=Santhosh%20Narayanan',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'romantic',
    genre: 'Chill Romantic',
  },

  // ⚡ SOUTH & PAN-INDIA REGIONAL HITS (Tamil, Malayalam, Kannada, Punjabi)
  {
    id: 'm0Yt29rq',
    title: 'Fear Song (From "Devara Part 1")',
    artist: 'Anirudh Ravichander',
    album: 'Devara Part 1',
    duration: '3:15',
    durationSec: 195,
    coverUrl: 'https://c.saavncdn.com/313/Devara-Part-1-Telugu-Telugu-2024-20240926171010-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/313/1178c7b2a16c3fd32ec5cd002b5a1ce0_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/313/1178c7b2a16c3fd32ec5cd002b5a1ce0_320.mp4') + '&title=Fear%20Song&artist=Anirudh%20Ravichander',
    quality: '320kbps HD',
    year: '2024',
    language: 'Telugu',
    mood: 'hype',
    genre: 'Mass BGM',
  },
  {
    id: '1870c4de',
    title: 'Hukum - Thalaivar Alappara (From "Jailer")',
    artist: 'Anirudh Ravichander',
    album: 'Jailer',
    duration: '3:27',
    durationSec: 207,
    coverUrl: 'https://c.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960_320.mp4') + '&title=Hukum&artist=Anirudh%20Ravichander',
    quality: '320kbps HD',
    year: '2023',
    language: 'Tamil',
    mood: 'hype',
    genre: 'Mass Anthem',
  },
  {
    id: 'kaavaalaa-jailer',
    title: 'Kaavaalaa (From "Jailer")',
    artist: 'Shilpa Rao & Anirudh Ravichander',
    album: 'Jailer',
    duration: '3:10',
    durationSec: 190,
    coverUrl: 'https://c.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/187/0c4d0aee91a3ac81d4b645ec448a2960_320.mp4') + '&title=Kaavaalaa&artist=Shilpa%20Rao',
    quality: '320kbps HD',
    year: '2023',
    language: 'Tamil',
    mood: 'party',
    genre: 'Party Item',
  },
  {
    id: 'wBgCQQ_6',
    title: 'Illuminati (From "Aavesham")',
    artist: 'Sushin Shyam & Dabzee',
    album: 'Aavesham',
    duration: '3:32',
    durationSec: 212,
    coverUrl: 'https://c.saavncdn.com/202/Aavesham-Original-Motion-Picture-Soundtrack-Malayalam-2024-20250910150630-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/202/ba6006006a2f40e6b20b5ced32cc2885_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/202/ba6006006a2f40e6b20b5ced32cc2885_320.mp4') + '&title=Illuminati&artist=Sushin%20Shyam',
    quality: '320kbps HD',
    year: '2024',
    language: 'Malayalam',
    mood: 'party',
    genre: 'Malayalam Groove',
  },
  {
    id: 'jaada-aavesham',
    title: 'Jaada (From "Aavesham")',
    artist: 'Sushin Shyam & Sreenath Bhasi',
    album: 'Aavesham',
    duration: '3:18',
    durationSec: 198,
    coverUrl: 'https://c.saavncdn.com/202/Aavesham-Original-Motion-Picture-Soundtrack-Malayalam-2024-20250910150630-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/202/ba6006006a2f40e6b20b5ced32cc2885_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/202/ba6006006a2f40e6b20b5ced32cc2885_320.mp4') + '&title=Jaada&artist=Sushin%20Shyam',
    quality: '320kbps HD',
    year: '2024',
    language: 'Malayalam',
    mood: 'romantic',
    genre: 'Malayalam Melody',
  },
  {
    id: 'singara-siriye-kantara',
    title: 'Singara Siriye (From "Kantara")',
    artist: 'Vijay Prakash, Ananya Bhat & B. Ajaneesh Loknath',
    album: 'Kantara',
    duration: '4:42',
    durationSec: 282,
    coverUrl: 'https://c.saavncdn.com/888/Kalki-2898-Ad-Telugu-Telugu-2024-20240712063717-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/888/ad1248d84cf30da97d5bad03b867e246_320.mp4') + '&title=Singara%20Siriye&artist=Vijay%20Prakash',
    quality: '320kbps HD',
    year: '2022',
    language: 'Kannada',
    mood: 'romantic',
    genre: 'Folk Melody',
  },
  {
    id: 'ra-ra-rakkamma',
    title: 'Ra Ra Rakkamma (From "Vikrant Rona")',
    artist: 'Nakash Aziz, Sunidhi Chauhan & B. Ajaneesh Loknath',
    album: 'Vikrant Rona',
    duration: '3:45',
    durationSec: 225,
    coverUrl: 'https://c.saavncdn.com/917/Tollywood-Heroines-Musical-Blockbusters-Telugu-2025-20251120161002-500x500.jpg',
    audioUrl: 'https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/917/6b9b050f895bdbdb6c7146ce4a240a06_320.mp4') + '&title=Ra%20Ra%20Rakkamma&artist=Nakash%20Aziz',
    quality: '320kbps HD',
    year: '2022',
    language: 'Kannada',
    mood: 'party',
    genre: 'Dance Dhamaka',
  },
  {
    id: 'punjabi-295-sidhu',
    title: '295',
    artist: 'Sidhu Moose Wala',
    album: 'Moosetape',
    duration: '4:30',
    durationSec: 270,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4') + '&title=295&artist=Sidhu%20Moose%20Wala',
    quality: '320kbps HD',
    year: '2021',
    language: 'Punjabi',
    mood: 'hype',
    genre: 'Punjabi Rap',
  },
  {
    id: 'punjabi-lover-diljit',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    duration: '3:05',
    durationSec: 185,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    audioUrl: 'https://aac.saavncdn.com/313/1178c7b2a16c3fd32ec5cd002b5a1ce0_320.mp4',
    downloadUrl: '/api/download?url=' + encodeURIComponent('https://aac.saavncdn.com/313/1178c7b2a16c3fd32ec5cd002b5a1ce0_320.mp4') + '&title=Lover&artist=Diljit%20Dosanjh',
    quality: '320kbps HD',
    year: '2021',
    language: 'Punjabi',
    mood: 'party',
    genre: 'Punjabi Pop',
  },
];

/**
 * Spotify-Style Mood Detector
 * Analyzes song title, artist, album, language, or explicit mood property to detect song vibe
 */
export function detectSongMood(song: Song | null): 'party' | 'sad' | 'romantic' | 'hype' | 'chill' {
  if (!song) return 'party';
  if (song.mood && ['party', 'sad', 'romantic', 'hype', 'chill'].includes(song.mood)) {
    return song.mood as any;
  }

  const text = `${song.title} ${song.artist} ${song.album} ${song.genre || ''}`.toLowerCase();

  // 1. Sad / Heartbreak / Emotional indicators
  const sadKeywords = [
    'sad', 'heartbreak', 'breakup', 'channa mereya', 'agar tum', 'tujhe kitna', 'priyathama',
    'kallolam', 'kalank', 'dard', 'alone', 'crying', 'tears', 'soul', 'judai', 'khairiyat',
    'bekhayali', 'dooriyan', 'tanha', 'gham', 'melancholy', 'phir le aya'
  ];
  if (sadKeywords.some((k) => text.includes(k))) return 'sad';

  // 2. Party / High Energy / Dance / Mass indicators
  const partyKeywords = [
    'pushpa pushpa', 'kissik', 'peeling', 'party', 'dance', 'dhamaka', 'madathapetti',
    'naatu naatu', 'oo antava', 'kaavaalaa', 'arabic kuthu', 'illuminati', 'rakkamma',
    'lover', 'banger', 'beat', 'dj', 'item', 'ta takkara', 'disco', 'dhol', 'nacho',
    'jimmiki', 'goli', 'mass', 'club'
  ];
  if (partyKeywords.some((k) => text.includes(k))) return 'party';

  // 3. Hype / Hero intro / Swagger / Rap
  const hypeKeywords = [
    'fear song', 'hukum', 'thalaivar', '295', 'sidhu', 'kgf', 'monster', 'beast',
    'animal', 'badass', 'hunter', 'roar', 'rap', 'hip hop', 'trap'
  ];
  if (hypeKeywords.some((k) => text.includes(k))) return 'hype';

  // 4. Romantic / Love / Melody indicators
  const romanticKeywords = [
    'romantic', 'love', 'romance', 'samajavaragamana', 'inkem', 'butta bomma', 'chuttamalle',
    'chaleya', 'kesariya', 'apna bana le', 'singara siriye', 'jaada', 'sooseki', 'tum hi ho',
    'satranga', 'heeriye', 'dil', 'pyaar', 'prema', 'ishq', 'duet', 'melody', 'sweet'
  ];
  if (romanticKeywords.some((k) => text.includes(k))) return 'romantic';

  return 'party';
}

/**
 * Spotify-Style Smart Next Track Recommender
 * Selects the highest quality next song that matches the current song's exact mood, vibe, tempo and language!
 */
export function getSmartNextSong(
  currentSong: Song,
  playedHistoryIds: string[] = [],
  pool: Song[] = CURATED_TRACKS
): Song {
  const currentMood = detectSongMood(currentSong);
  const currentLang = currentSong.language || 'Telugu';
  const currentArtist = currentSong.artist.toLowerCase();

  // Exclude current song and heavily repeated songs in history if pool is large enough
  let candidates = pool.filter((s) => s.id !== currentSong.id);
  const unplayedCandidates = candidates.filter((s) => !playedHistoryIds.slice(0, 8).includes(s.id));
  
  if (unplayedCandidates.length > 0) {
    candidates = unplayedCandidates;
  }

  // Score candidate tracks based on Spotify similarity parameters
  const scored = candidates.map((candidate) => {
    let score = 0;
    const candidateMood = detectSongMood(candidate);

    // 1. Exact Mood Match (+60 points - HIGHEST WEIGHT)
    if (candidateMood === currentMood) {
      score += 60;
    } else if (
      (currentMood === 'party' && candidateMood === 'hype') ||
      (currentMood === 'hype' && candidateMood === 'party') ||
      (currentMood === 'romantic' && candidateMood === 'chill')
    ) {
      score += 30; // Compatible mood
    }

    // 2. Language continuity (+25 points)
    if (candidate.language && candidate.language === currentLang) {
      score += 25;
    }

    // 3. Artist/Composer continuity (+20 points)
    const candidateArtist = candidate.artist.toLowerCase();
    const sharedArtist =
      (currentArtist.includes('devi sri prasad') && candidateArtist.includes('devi sri prasad')) ||
      (currentArtist.includes('anirudh') && candidateArtist.includes('anirudh')) ||
      (currentArtist.includes('arijit') && candidateArtist.includes('arijit')) ||
      (currentArtist.includes('thaman') && candidateArtist.includes('thaman')) ||
      (currentArtist.includes('sushin') && candidateArtist.includes('sushin')) ||
      (currentArtist.includes('sid sriram') && candidateArtist.includes('sid sriram'));

    if (sharedArtist) {
      score += 20;
    }

    // Add tiny random jitter (0-5) so multiple top-matching songs have natural variety
    score += Math.random() * 5;

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.candidate || pool[0];
}
