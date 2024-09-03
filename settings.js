document
  .getElementById('settingsForm')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    const openAIApiKey = document.getElementById('openAIApiKey').value;
    const cloudName = document.getElementById('cloudName').value;
    const uploadPreset = document.getElementById('uploadPreset').value;

    localStorage.setItem('openAIApiKey', openAIApiKey);
    localStorage.setItem('cloudName', cloudName);
    localStorage.setItem('uploadPreset', uploadPreset);

    document.getElementById('saveSettings').innerHTML = 'Saved';
    setTimeout(() => {
      if (openAIApiKey && cloudName && uploadPreset) {
        hideSettings();
      }
    }, 1000);
  });

// Populate form with existing values
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('openAIApiKey').value =
    localStorage.getItem('openAIApiKey') || '';
  document.getElementById('cloudName').value =
    localStorage.getItem('cloudName') || '';
  document.getElementById('uploadPreset').value =
    localStorage.getItem('uploadPreset') || '';
});
