# Virtual Try-On Chrome Extension

This Chrome extension enables users to virtually try on clothing items from any e-commerce website using AI-powered image processing.

## Demo

Check out this video demonstration of the Virtual Try-On Chrome Extension:

[![Virtual Try-On Demo](https://img.youtube.com/vi/1LQ2345lANM/0.jpg)](https://youtu.be/1LQ2345lANM)

## Features

- Works on any e-commerce website
- Select your image once and easily reuse it across different websites
- Protects your privacy by not sending personal data or images to any server other than Hugging Face for AI processing

## How It Works

- Captures the product's primary image from HTML using OpenAI GPT-4
- Uploads the person's image to Cloudinary for easy AI access
- Utilizes the Kolors model on Hugging Face via Gradio API
- Stores person and result images in browser cache for improved usability

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Setup

Before using the extension, you need to set up the following:

### OpenAI API Key

1. Go to [OpenAI](https://platform.openai.com/signup) and sign up for an account
2. Navigate to the [API keys page](https://platform.openai.com/account/api-keys)
3. Click "Create new secret key" and copy the generated key

### Cloudinary Cloud Name and Upload Preset

1. Sign up for a [Cloudinary account](https://cloudinary.com/users/register/free)
2. Log in to your Cloudinary dashboard
3. Your Cloud Name is displayed in the dashboard's top-left corner
4. To create an upload preset:
   - Go to Settings > Upload
   - Scroll to "Upload presets" and click "Add upload preset"
   - Choose a preset name and set "Signing Mode" to "Unsigned"
   - Save the preset

## Usage

1. Click the extension icon in Chrome to open the popup
2. Click the settings icon (⚙️) and enter your API keys:
   - OpenAI API Key
   - Cloudinary Cloud Name
   - Cloudinary Upload Preset
3. Save the settings
4. Upload or select a person image
5. Navigate to a product page on an e-commerce website
6. Click "Try On" to see the virtual try-on result

## Credits

- [Kwai-Kolors](https://github.com/Kwai-Kolors) by KuaiShou for the AI model
- Hugging Face and Gradio for providing the GPU to run the model
- Cursor Editor for easing the development process

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.