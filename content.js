chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getProductImage') {
    getProductImageUrl(request.openAIApiKey).then(sendResponse);
    return true; // Indicates we will send a response asynchronously
  }
});

async function getProductImageUrl(openAIApiKey) {
  const htmlContent = document.documentElement.outerHTML;
  const productImageUrl = await getProductImageFromGPT(
    htmlContent,
    openAIApiKey
  );
  return { productImageUrl };
}

async function getProductImageFromGPT(htmlContent, openAIApiKey) {
  console.log('getProductImageFromGPT', openAIApiKey, !openAIApiKey);
  if (!openAIApiKey) {
    console.error('OpenAI API key not provided');
    return null;
  }

  const apiUrl = 'https://api.openai.com/v1/chat/completions';

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
