// API Base URL
const API_URL = 'http://localhost:3000';

// DOM Elements
const nicknameInput = document.getElementById('nicknameInput');
const saveBtn = document.getElementById('saveBtn');
const messageDiv = document.getElementById('message');
const nicknameList = document.getElementById('nicknameList');

// Show message (success or error)
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  
  // Hide message after 3 seconds
  setTimeout(() => {
    messageDiv.className = 'message';
  }, 3000);
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load and display nicknames
async function loadNicknames() {
  try {
    const response = await fetch(`${API_URL}/list-nicknames`);
    const data = await response.json();
    
    if (data.nicknames && data.nicknames.length > 0) {
      nicknameList.innerHTML = data.nicknames
        .map(item => `
          <li>
            <span class="nickname-name">${item.nickname}</span>
            <span class="nickname-date">${formatDate(item.created_at)}</span>
          </li>
        `)
        .join('');
    } else {
      nicknameList.innerHTML = '<div class="empty-state">No nicknames yet. Add one!</div>';
    }
  } catch (error) {
    console.error('Error loading nicknames:', error);
    showMessage('Failed to load nicknames', 'error');
  }
}

// Save nickname
async function saveNickname() {
  const nickname = nicknameInput.value.trim();
  
  // Validate
  if (!nickname) {
    showMessage('Please enter a nickname', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/save-nickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage(`Nickname "${nickname}" saved!`, 'success');
      nicknameInput.value = '';
      nicknameInput.focus();
      loadNicknames(); // Refresh the list
    } else {
      showMessage(data.error || 'Failed to save nickname', 'error');
    }
  } catch (error) {
    console.error('Error saving nickname:', error);
    showMessage('Failed to save nickname', 'error');
  }
}

// Event Listeners
saveBtn.addEventListener('click', saveNickname);

// Allow Enter key to save
nicknameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveNickname();
  }
});

// Load nicknames when page loads
loadNicknames();