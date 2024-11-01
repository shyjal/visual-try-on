document.addEventListener('DOMContentLoaded', function () {
  const tryOnButton = document.getElementById('tryOn');
  const resultDiv = document.getElementById('result');
  const loader = document.getElementById('loader');
  const loadingMessage = document.getElementById('loadingMessage');
  const personImageInput = document.getElementById('personImage');
  const cachedImagesDiv = document.getElementById('cachedImages');

  let selectedImageUrl = null;

  // Load and display cached images
  loadCachedImages();

  // Load and display last result
  loadLastResult();

  // Create and append the upload new image button
  const uploadNewImage = document.createElement('label');
  uploadNewImage.id = 'uploadNewImage';
  uploadNewImage.textContent = '+';
  uploadNewImage.setAttribute('for', 'personImage');
  cachedImagesDiv.appendChild(uploadNewImage);

  personImageInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadNewImage.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: white; text-shadow: 0 0 3px rgba(0,0,0,0.5);">+</span>
        `;
      };
      reader.readAsDataURL(file);
      tryOnButton.disabled = false;
      selectedImageUrl = null;
      // Deselect any previously selected cached image
      document
        .querySelectorAll('.cached-image')
        .forEach((img) => img.classList.remove('selected'));
    } else {
      resetUploadButton();
      tryOnButton.disabled = !selectedImageUrl;
    }
  });

  tryOnButton.addEventListener('click', function () {
    if (selectedImageUrl) {
      startVirtualTryOn(selectedImageUrl);
    } else if (personImageInput.files.length > 0) {
      const personImageFile = personImageInput.files[0];

      uploadImgToHf(personImageFile).then((personImageUrl) => {
          console.log("personImageUrl", personImageUrl);

          const newCachedImage = cacheImage(personImageUrl);
          selectCachedImage(newCachedImage, personImageUrl);
          startVirtualTryOn(personImageUrl);
          resetUploadButton();
      });
      //uploadImageToCloudinary(personImageFile)
      //  .then((personImageUrl) => {
      //  
      //    const newCachedImage = cacheImage(personImageUrl);
      //    selectCachedImage(newCachedImage, personImageUrl);
      //    startVirtualTryOn(personImageUrl);
      //    resetUploadButton();
      //  })
      //  .catch((error) => {
      //    showError('Error: ' + error.message);
      //    console.error('Error uploading image to Cloudinary:', error);
      //  });
    } else {
      alert('Please select an image or upload a new one.');
    }
  });

  function resetUploadButton() {
    uploadNewImage.innerHTML = '<span style="font-size: 24px;">+</span>';
  }

  function startVirtualTryOn(personImageUrl) {
    loader.style.display = 'block';
    loadingMessage.style.display = 'block';
    resultDiv.textContent = '';
    tryOnButton.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentPageUrl = tabs[0].url; // Get the current page URL
      const openAIApiKey = localStorage.getItem('openAIApiKey');
      const openAIApi = localStorage.getItem('openAIApi');
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ['content.js'],
        },
        () => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'getProductImage', openAIApiKey: openAIApiKey, openAIApi: openAIApi },
            function (response) {
              if (response && response.productImageUrl) {
                performVirtualTryOn(
                  personImageUrl,
                  response.productImageUrl,
                  currentPageUrl
                );
              } else {
                showError("Couldn't find product image.");
              }
            }
          );
        }
      );
    });
  }

  function loadCachedImages() {
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    cachedUrls.forEach((url) => {
      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      //img.src = url;
      img.src = "https://kwai-kolors-kolors-virtual-try-on.hf.space/file=" + url;
      img.classList.add('cached-image');
      img.addEventListener('click', () => selectCachedImage(img, url));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCachedImage(url, imgContainer);
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);
      cachedImagesDiv.appendChild(imgContainer);
    });
  }

  function deleteCachedImage(url, imgContainer) {
    // Remove from localStorage
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    const updatedUrls = cachedUrls.filter((cachedUrl) => cachedUrl !== url);
    localStorage.setItem('cachedImageUrls', JSON.stringify(updatedUrls));

    // Remove from DOM
    cachedImagesDiv.removeChild(imgContainer);

    // Reset selection if the deleted image was selected
    if (selectedImageUrl === url) {
      selectedImageUrl = null;
      tryOnButton.disabled = true;
    }
  }

  function selectCachedImage(imgElement, url) {
    document
      .querySelectorAll('.cached-image')
      .forEach((img) => img.classList.remove('selected'));
    imgElement.classList.add('selected');
    selectedImageUrl = url;
    tryOnButton.disabled = false;
    personImageInput.value = '';
    resetUploadButton();
  }

  function cacheImage(url) {
    const cachedUrls = JSON.parse(
      localStorage.getItem('cachedImageUrls') || '[]'
    );
    if (!cachedUrls.includes(url)) {
      cachedUrls.unshift(url);
      if (cachedUrls.length > 5) cachedUrls.pop(); // Keep only the last 5 images
      localStorage.setItem('cachedImageUrls', JSON.stringify(cachedUrls));

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      img.src = "https://kwai-kolors-kolors-virtual-try-on.hf.space/file=" + url;
      img.classList.add('cached-image');
      img.addEventListener('click', () => selectCachedImage(img, url));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCachedImage(url, imgContainer);
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);
      cachedImagesDiv.insertBefore(imgContainer, uploadNewImage);

      if (cachedImagesDiv.querySelectorAll('.image-container').length > 5) {
        cachedImagesDiv.removeChild(
          cachedImagesDiv.children[cachedImagesDiv.children.length - 2]
        );
      }

      return img; // Return the newly created image element
    }
    return null;
  }

  function showError(message) {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none';
    resultDiv.innerHTML = message;
    tryOnButton.disabled = false;
  }
function getMimeTypeFromUrl(url) {
  // 获取文件扩展名
  const extension = url.split('.').pop().split('?')[0]; // 移除URL参数

  // 根据扩展名推测图片类型
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream'; // 未知类型
  }
}

function uploadImgToHf(file) {
    loadingMessage.textContent = 'Uploading picture...';

    // 创建FormData对象
    const formData = new FormData();
    // 将文件添加到FormData对象
    formData.append('files', file);

    return fetch("https://kwai-kolors-kolors-virtual-try-on.hf.space/upload?upload_id="+Math.random().toString(36).substring(2), {
        method: 'POST',
        body: formData
    })
    .then((response) => response.json())
    .then((data) => {
        return data[0];
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function uploadImg(imageUrl) {
    // 下载图片
    loadingMessage.textContent = 'Downloading picture...';
    return fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        
        // 创建一个文件对象
        const file = new File([blob], imageUrl.split('/').pop().split('?')[0], { type: getMimeTypeFromUrl(imageUrl) });
        
        return uploadImgToHf(file)
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

async function performVirtualTryOn(
    personImageUrl,
    productImageUrl,
    currentPageUrl
  ) {
    //var imgData = ;
    //console.log("imgData", imgData);
    var img1Path = personImageUrl;//'/tmp/gradio/31fd1d52ee41559dcda55e304aef19df2767ff1c76295480d838210868fb63a5/黄教主.jpg';
    var img2Path = await uploadImg(productImageUrl);
    //var img2Path = '/tmp/gradio/d4de1f8fc430bb0ff3210b329abeea6c65b52127b65588adcaf469c7204c5a80/1234.png';
    var personImageUrl = `https://kwai-kolors-kolors-virtual-try-on.hf.space/file=${img1Path}`
    var productImageUrl = `https://kwai-kolors-kolors-virtual-try-on.hf.space/file=${img2Path}`
    const payload = {
      data: [{ path: img1Path, url: personImageUrl, is_stream: false, meta: {_type: "gradio.FileData"} }, { path: img2Path, url: productImageUrl, is_stream: false, meta: {_type: "gradio.FileData"} }, 0, true],
      "fn_index":2,"trigger_id":26,"session_hash":Math.random().toString(36).substring(2),
    };


    //fetch('https://kwai-kolors-kolors-virtual-try-on.hf.space/call/tryon', {
    loadingMessage.textContent = 'It may take around 30s to dress up the person';
    fetch('https://kwai-kolors-kolors-virtual-try-on.hf.space/queue/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify(payload),
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error: ' + response.status);
        }

        response.json().then((data) => {
          const eventId = data.event_id;
          listenForResult(payload["session_hash"], productImageUrl, currentPageUrl);
        });
      })
      .catch((error) => {
        showError(
          'Could not do virtual try-on because kolors is busy,<br/> Please try again or use <a href="https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On" target="_blank">Huggingface space</a> directly.'
        );
        console.error('Error in virtual try-on process:', error, JSON.stringify(payload));
      });
  }

  function listenForResult(eventId, productImageUrl, currentPageUrl) {
    fetch(
      //`https://kwai-kolors-kolors-virtual-try-on.hf.space/call/tryon/${eventId}`
      `https://kwai-kolors-kolors-virtual-try-on.hf.space/queue/data?session_hash=${eventId}`
    )
      .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        //console.log(reader)

        reader.read().then(function processText({ done, value }) {
        //console.log(done, value)
          if (done) {
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split('\n');
          //console.log(lines);

          for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].startsWith('data:')) {
              //const event = lines[i].split('event: ')[1];
              //console.error('event', event);
              //console.error('lines[i + 1]', lines[i + 1]);
              //const data = JSON.parse(lines[i + 1].split('data: ')[1]);
              const data = JSON.parse(lines[i].split('data: ')[1]);
              console.log('data', data);
              // data: {"msg":"process_completed","event_id":"9f5e9477fac649a7b3171ae2b78cac19","output":{"data":[{"path":"/tmp/gradio/2c0e3039e9797016b4a17cadfd2d2d77b442db23ecd9eda5f811f52d109f52f9/image.webp","url":"https://kwai-kolors-kolors-virtual-try-on.hf.space/file=/tmp/gradio/2c0e3039e9797016b4a17cadfd2d2d77b442db23ecd9eda5f811f52d109f52f9/image.webp","size":null,"orig_name":"image.webp","mime_type":null,"is_stream":false,"meta":{"_type":"gradio.FileData"}},94219,"Success"],"is_generating":false,"duration":22.94722294807434,"average_duration":39.17741922320664,"render_config":null,"changed_state_ids":[]},"success":true}
              if (data['msg'] === 'process_completed') {
                if (data['success']) {
                  const resultUrl = data['output']['data'][0].url;
                  if (chrome.storage && chrome.storage.local) {
                    // Cache the result only if chrome.storage is available
                    const cacheData = {};
                    cacheData[currentPageUrl] = resultUrl; // Use current page URL as key
                    chrome.storage.local.set(cacheData, function () {
                      console.log('Result cached for', currentPageUrl);
                    });
                  }
                  displayResult(resultUrl);
                } else {
                  showError(
                    'Could not do virtual try-on because kolors is busy,<br/> Please try again or use <a href="https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On" target="_blank">Huggingface space</a> directly.'
                  );
                }
                return;
              } else if (event === 'error') {
                showError(
                  'Could not do virtual try-on because kolors is busy,<br/> Please try again or use <a href="https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On" target="_blank">Huggingface space</a> directly.'
                );
                return;
              }
            }
          }

          buffer = lines[lines.length - 1];
          reader.read().then(processText);
        });
      })
      .catch((error) => {
        showError('Error: ' + error.message);
        console.error('Error in virtual try-on process:', error);
      });
  }

  function loadLastResult() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentPageUrl = tabs[0].url; // Get the current page URL
      chrome.storage.local.get([currentPageUrl], function (result) {
        if (result[currentPageUrl]) {
          displayResult(result[currentPageUrl]);
        }
      });
    });
  }

  function displayResult(resultUrl) {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none';
    const img = document.createElement('img');
    img.src = resultUrl;
    img.style.maxWidth = '100%';
    resultDiv.innerHTML = '';
    resultDiv.appendChild(img);
  }

  const settingsButton = document.getElementById('settingsButton');
  settingsButton.addEventListener('click', toggleSettings);

  checkAndShowSettings();

  function checkAndShowSettings() {
    const openAIApiKey = localStorage.getItem('openAIApiKey');
    const cloudName = localStorage.getItem('cloudName');
    const uploadPreset = localStorage.getItem('uploadPreset');

    if (!openAIApiKey || !cloudName || !uploadPreset) {
      showSettings();
    }
  }

  // chrome.storage.local.clear(function () {
  //   console.log('Storage cleared');
  // });
});
