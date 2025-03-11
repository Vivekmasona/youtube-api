const express = require("express");
const app = express();

app.get("/watch", (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.send("Video ID required!");

    const page = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VFY Custom Player</title>
        <script src="https://www.youtube.com/iframe_api"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css"><style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
            body { background: #121212; color: white; text-align: center; padding-top: 10px; }
            
            #player-container {
                position: relative; width: 80%; max-width: 800px; margin: auto; 
                background: #000; border-radius: 10px; overflow: hidden;
            }
            
            #player { width: 100%; aspect-ratio: 16/9; }

            /* Watermark */
            .watermark {
                position: absolute; top: 10px; right: 10px; 
                background: rgba(255, 0, 0, 0.7); padding: 5px 10px; 
                font-size: 14px; font-weight: bold; border-radius: 5px;
            }

            /* Custom Controls */
            .controls {
                display: flex; justify-content: space-between; align-items: center;
                padding: 10px; background: rgba(0,0,0,0.8); border-radius: 0 0 10px 10px;
            }

            .btn {
                background: #FF0000; color: white; padding: 10px; border: none; 
                font-size: 18px; cursor: pointer; border-radius: 50%; width: 40px; height: 40px;
            }

            .btn:hover { background: darkred; }

            .seek-bar, .volume-bar {
                flex: 1; margin: 0 10px; cursor: pointer;
            }

            /* Floating Water Controls */
            .floating-controls {
                position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6);
                padding: 5px; border-radius: 5px; display: flex; gap: 10px;
            }

        </style>
    </head>
    <body>

        <h2>VFY Custom Player</h2>

        <div id="player-container">
            <div id="player"></div>
            <div class="watermark">VFY</div>

            <!-- Floating Water Controls (Speed, Quality, PIP) -->
            <div class="floating-controls">
                <button class="btn" id="pip"><i class="fas fa-external-link-alt"></i></button>
                <button class="btn" id="speed"><i class="fas fa-tachometer-alt"></i></button>
                <button class="btn" id="quality"><i class="fas fa-cog"></i></button>
            </div>
        </div>

        <!-- Footer Controls -->
        <div class="controls">
            <button class="btn" id="playPause"><i class="fas fa-play"></i></button>
            <input type="range" id="seekBar" class="seek-bar" min="0" max="100" value="0">
            <button class="btn" id="muteToggle"><i class="fas fa-volume-up"></i></button>
            <input type="range" id="volumeBar" class="volume-bar" min="0" max="100" value="100">
            <button class="btn" id="fullscreen"><i class="fas fa-expand"></i></button>
        </div>

        <script>
            let player;
            function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                    videoId: '${videoId}', 
                    playerVars: { autoplay: 1, controls: 0, playsinline: 1 },
                    events: { 'onReady': onPlayerReady, 'onStateChange': updateSeekBar }
                });
            }

            function onPlayerReady(event) {
                player.mute();
                player.playVideo();
                setTimeout(() => player.unMute(), 1000);
            }

            function updateSeekBar() {
                setInterval(() => {
                    if (player && player.getDuration) {
                        let current = player.getCurrentTime();
                        let total = player.getDuration();
                        document.getElementById("seekBar").value = (current / total) * 100;
                    }
                }, 1000);
            }

            document.getElementById("playPause").addEventListener("click", () => {
                if (player.getPlayerState() === 1) {
                    player.pauseVideo();
                    document.getElementById("playPause").innerHTML = "<i class='fas fa-play'></i>";
                } else {
                    player.playVideo();
                    document.getElementById("playPause").innerHTML = "<i class='fas fa-pause'></i>";
                }
            });

            document.getElementById("muteToggle").addEventListener("click", () => {
                if (player.isMuted()) {
                    player.unMute();
                    document.getElementById("muteToggle").innerHTML = "<i class='fas fa-volume-up'></i>";
                } else {
                    player.mute();
                    document.getElementById("muteToggle").innerHTML = "<i class='fas fa-volume-mute'></i>";
                }
            });

            document.getElementById("fullscreen").addEventListener("click", () => {
                let container = document.getElementById("player-container");
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen();
                }
            });

            document.getElementById("seekBar").addEventListener("input", (e) => {
                let newTime = (e.target.value / 100) * player.getDuration();
                player.seekTo(newTime);
            });

            document.getElementById("volumeBar").addEventListener("input", (e) => {
                player.setVolume(e.target.value);
            });

            document.getElementById("pip").addEventListener("click", () => {
                if (player.getIframe().requestPictureInPicture) {
                    player.getIframe().requestPictureInPicture();
                }
            });

            document.getElementById("speed").addEventListener("click", () => {
                let speeds = [0.5, 1, 1.5, 2];
                let currentSpeed = player.getPlaybackRate();
                let newSpeed = speeds[(speeds.indexOf(currentSpeed) + 1) % speeds.length];
                player.setPlaybackRate(newSpeed);
            });

        </script>

    </body>
    </html>
    `;
    
    res.send(page);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
