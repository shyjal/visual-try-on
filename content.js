chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getProductImage') {
    getProductImageUrl(request.openAIApiKey, request.openAIApi).then(sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
});

async function getProductImageUrl(openAIApiKey, openAIApi) {
  if (location.href.indexOf("taobao.com") !== -1 || location.href.indexOf("tmall.com") !== -1) {
    // 选择所有元素
    const url = document.querySelector("[class^='mainPicWrap--']").querySelector("img").src;
    return new Promise((resolve, reject) => {
      // 假设异步操作成功，调用resolve
      //resolve({productImageUrl: url});
      resolve({productImageUrl: url.replace("_.webp", "")});
    });
  }

  var imgEles = document.querySelectorAll("img");
  if (imgEles.length === 1) {
      return new Promise((resolve, reject) => {
        resolve({productImageUrl: imgEles[0].src});
      });
  }

  const htmlContent = document.documentElement.outerHTML;
  const productImageUrl = await getProductImageFromGPT(
    htmlContent,
    openAIApiKey,
    openAIApi
  );
  return { productImageUrl };
}

async function getProductImageFromGPT(htmlContent, openAIApiKey, apiUrl) {
  console.log('getProductImageFromGPT', openAIApiKey, !openAIApiKey);
  if (!openAIApiKey) {
    console.error('OpenAI API key not provided');
    return null;
  }

  const prompt = `
    Analyze the following HTML content and extract the URL of the main product image.
    Look for both <img> tags and CSS background-image properties.
    Consider elements and children with class names or IDs containing words like 'product-image' 'product', 'main', 'featured' etc.
    Return only the full URL with commonly used image extensions (jpg, jpeg, png, webp) of the main product image in JSON format, with the key "productImageUrl".
    If you can't find a product image, return {"productImageUrl": null}.

    HTML content:
    ${htmlContent.substring(
      0,
      50000
    )} // Limiting to few characters to avoid exceeding token limits
  `;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: {
          type: 'json_object',
        },
      }),
    });

    const data = await response.json();

    const result = JSON.parse(data.choices[0].message.content.trim());
    return result.productImageUrl;
  } catch (error) {
    console.error('Error fetching product image from GPT-4o:', error);
    return null;
  }
}
