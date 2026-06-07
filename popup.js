// কনফিগারেশন
const ADS_URL = "https://www.effectivecpmnetwork.com/x1yp7dh4?key=ce980baf90bca153da726ee88d1874a3";

// ফাংশন: বর্তমান ট্যাবের URL চেক করে সিনেমা পেজ কিনা
function isImdbMoviePage(url) {
  if (!url) return false;
  return /^https?:\/\/(www\.)?imdb\.com\/title\/tt\d+/.test(url);
}

// ফাংশন: IMDB URL কে playimdb URL এ রূপান্তর
function convertToPlayUrl(imdbUrl) {
  try {
    const url = new URL(imdbUrl);
    // শুধু hostname পরিবর্তন
    url.hostname = url.hostname.replace('imdb', 'playimdb');
    return url.toString();
  } catch (e) {
    console.error('Conversion error:', e);
    return null;
  }
}

// ফাংশন: 3টি অ্যাড ও 1টি আসল লিংক খোলা
function openAllTabs(realPlayUrl) {
  // 3টি অ্যাড ট্যাব (active: false মানে পেছনে খুলবে)
  for (let i = 0; i < 3; i++) {
    chrome.tabs.create({ url: ADS_URL, active: false });
  }
  // আসল মুভি ট্যাব (active: true দিয়ে সামনে খুলবে)
  if (realPlayUrl) {
    chrome.tabs.create({ url: realPlayUrl, active: true });
  } else {
    showError('Real movie URL is invalid');
  }
}

// এরর মেসেজ দেখানোর ফাংশন
function showError(msg) {
  const errDiv = document.getElementById('errorMsg');
  if (errDiv) {
    errDiv.innerText = msg;
    errDiv.style.display = 'block';
    setTimeout(() => { errDiv.style.display = 'none'; }, 5000);
  } else {
    alert(msg);
  }
}

// পপআপ লোড হওয়ার সময় UI প্রস্তুত করা
function initPopup() {
  // ডিবাগ লগ (কনসোল চেক করুন পপআপের inspect এলিমেন্টে)
  console.log('Popup opened, checking current tab...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      showError('Extension error: ' + chrome.runtime.lastError.message);
      return;
    }
    if (!tabs || tabs.length === 0) {
      showError('No active tab found');
      return;
    }
    
    const currentUrl = tabs[0].url;
    console.log('Current URL:', currentUrl);
    
    const isMovie = isImdbMoviePage(currentUrl);
    console.log('Is movie page?', isMovie);
    
    const visitContainer = document.getElementById('visitImdbContainer');
    const watchContainer = document.getElementById('watchNowContainer');
    
    if (isMovie) {
      visitContainer.style.display = 'none';
      watchContainer.style.display = 'block';
      
      // Watch Now বাটন সেটআপ
      const watchBtn = document.getElementById('singleWatchBtn');
      // পুরনো ইভেন্ট লিসেনার রিমুভ করতে clone & replace
      const newBtn = watchBtn.cloneNode(true);
      watchBtn.parentNode.replaceChild(newBtn, watchBtn);
      
      const playUrl = convertToPlayUrl(currentUrl);
      console.log('Converted play URL:', playUrl);
      if (playUrl) {
        newBtn.addEventListener('click', () => {
          openAllTabs(playUrl);
        });
      } else {
        newBtn.disabled = true;
        newBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Invalid Movie URL';
        showError('Could not convert IMDb URL to play URL');
      }
    } else {
      visitContainer.style.display = 'block';
      watchContainer.style.display = 'none';
    }
  });
}

// Visit IMDB বাটনের ইভেন্ট
document.getElementById('visitImdbBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.imdb.com/?ref_=sr_nv_home' });
});

// ডকুমেন্ট রেডি হলে ইনিশিয়ালাইজ
document.addEventListener('DOMContentLoaded', initPopup);

console.log
