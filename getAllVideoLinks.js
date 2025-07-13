const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = '';
const CHANNEL_ID = 'UCHIcMfkPMTEllfF8LHndB-Q';

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
        const videoIframes = [];

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
                const embedHtml = `
                    <h3>${videoTitle}</h3>
                    <iframe width="560" height="315" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                    <br><br>
                `;
                videoIframes.push(embedHtml);
            }

            nextPageToken = playlistRes.data.nextPageToken;
        } while (nextPageToken);

        const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Vidéos YouTube</title>
</head>
<body>
  <h1>Mes vidéos YouTube</h1>
  ${videoIframes.join('\n')}
</body>
</html>`;

        const filePath = "C:\\Users\\kriss\\IdeaProjects\\api_you_tube\\videos.html";
        fs.writeFileSync(filePath, fullHtml, 'utf-8');

        console.log(`✅ ${videoIframes.length} vidéos intégrées dans ${filePath}`);
    } catch (error) {
        console.error('❌ Erreur :', error.response?.data || error.message);
    }
}

getAllVideoEmbeds();
