const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = ''; // <-- à remplir
const CHANNEL_ID = 'UCIjj5MCmVC6eX51Z7Q4Wpwg';

async function getAllVideoEmbeds() {
    try {
        const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'contentDetails',
                id: CHANNEL_ID,
                key: API_KEY,
            },
        });

        const uploadPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

        let nextPageToken = '';
        const videoData = [];

        do {
            const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                    part: 'snippet',
                    playlistId: uploadPlaylistId,
                    maxResults: 50,
                    pageToken: nextPageToken,
                    key: API_KEY,
                },
            });

            for (const item of playlistRes.data.items) {
                const videoId = item.snippet.resourceId.videoId;
                const videoTitle = item.snippet.title;
                videoData.push({ title: videoTitle, id: videoId });
            }

            nextPageToken = playlistRes.data.nextPageToken;
        } while (nextPageToken);

        const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Mes vidéos YouTube</title>
  <style>
    :root {
      --primary: #4f46e5;
      --background: #f9fafb;
      --text: #111827;
      --card-bg: #ffffff;
      --shadow: rgba(0, 0, 0, 0.1);
    }

    body {
      background-color: var(--background);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: var(--text);
      margin: 0;
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: var(--primary);
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .search-bar {
      text-align: center;
      margin-bottom: 30px;
    }

    .search-bar input {
      padding: 10px;
      width: 80%;
      max-width: 500px;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 6px var(--shadow);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      padding: 0 20px;
    }

    .video {
      background-color: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 10px var(--shadow);
      overflow: hidden;
      transition: transform 0.3s ease;
    }

    .video:hover {
      transform: translateY(-5px);
    }

    .video h3 {
      padding: 15px;
      font-size: 1.1rem;
      border-bottom: 1px solid #eee;
      background: linear-gradient(90deg, #6366f1, #a78bfa);
      color: white;
      margin: 0;
    }

    iframe {
      width: 100%;
      display: block;
    }

    #no-results {
      text-align: center;
      font-style: italic;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Mes vidéos YouTube</h1>
  <div class="search-bar">
    <input type="text" id="search" placeholder="Rechercher une vidéo...">
  </div>
  <div class="grid" id="video-list"></div>
  <p id="no-results" style="display:none;">Aucune vidéo trouvée.</p>

  <script>
    const videos = ${JSON.stringify(videoData, null, 2)};

    const container = document.getElementById("video-list");
    const searchInput = document.getElementById("search");
    const noResults = document.getElementById("no-results");

    function renderVideos(filter = "") {
      const filtered = videos.filter(v => v.title.toLowerCase().includes(filter.toLowerCase()));
      container.innerHTML = "";
      if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
      }
      noResults.style.display = "none";
      filtered.forEach(({ title, id }) => {
        const el = document.createElement("div");
        el.className = "video";
        el.innerHTML = \`
          <h3>\${title}</h3>
          <iframe width="560" height="315" 
              src="https://www.youtube.com/embed/\${id}" 
              frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
          </iframe>
        \`;
        container.appendChild(el);
      });
    }

    searchInput.addEventListener("input", (e) => renderVideos(e.target.value));
    renderVideos();
  </script>
</body>
</html>
`;

        const filePath = path.join(__dirname, 'videos.html');
        fs.writeFileSync(filePath, fullHtml, 'utf-8');
        console.log(`✅ ${videoData.length} vidéos intégrées dans ${filePath}`);
    } catch (error) {
        console.error('❌ Erreur :', error.response?.data || error.message);
    }
}

getAllVideoEmbeds();
