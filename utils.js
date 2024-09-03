function resizeImage(file, maxWidth) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function uploadImageToCloudinary(imageFile) {
  const cloudName = localStorage.getItem('cloudName'); // Replace with your Cloudinary cloud name
  const uploadPreset = localStorage.getItem('uploadPreset'); // Replace with your Cloudinary upload preset

  return resizeImage(imageFile, 500).then((resizedFile) => {
    const formData = new FormData();
    formData.append('file', resizedFile);
    formData.append('upload_preset', uploadPreset);

    return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.secure_url) {
          return data.secure_url;
        } else {
          throw new Error('Failed to upload image to Cloudinary');
        }
      });
  });
}

function showSettings() {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('settingsContent').style.display = 'block';
}

function hideSettings() {
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('settingsContent').style.display = 'none';
}

function toggleSettings() {
  const settingsContent = document.getElementById('settingsContent');
  if (settingsContent.style.display === 'none') {
    showSettings();
  } else {
    hideSettings();
  }
}
