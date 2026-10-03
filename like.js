(function () {
  // いいねボタンの設置場所を探す
  const containers = document.querySelectorAll(".jimdo-like-btn-area:not([data-initialized])");

  containers.forEach(container => {
    container.setAttribute("data-initialized", "true");

    // ボタンの見た目（HTML）を自動生成
    container.innerHTML = `
      <div style="display:flex; justify-content:center; margin:35px 0 20px;">
        <button type="button" class="j-like-btn" style="
          display:inline-flex; align-items:center; gap:8px; padding:10px 22px;
          font-size:15px; font-weight:bold; color:#e0245e; background-color:#ffffff;
          border:2px solid #ffb8ca; border-radius:9999px; cursor:pointer;
          box-shadow:0 4px 10px rgba(224,36,94,0.08); transition:all 0.15s ease-in-out;
          user-select:none; -webkit-tap-highlight-color:transparent; outline:none;">
          <span class="j-like-heart" style="font-size:20px; display:inline-block; transition:transform 0.12s ease;">❤️</span>
          <span>いいね！</span>
          <span class="j-like-count" style="background:#ffe6ed; color:#e0245e; padding:2px 10px; border-radius:999px; min-width:22px; text-align:center; font-size:14px;">-</span>
        </button>
      </div>
    `;

    // ▼▼▼ あなたのGASのウェブアプリURL ▼▼▼
    const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxrqimOoWFhPL1zwVOs3lzX6kLy5_KWu5dMewk8_8bSmsj3-EP7uMF4o7oaJ-pmyOKtGg/exec";

    let articleKey = "";
    try {
      articleKey = decodeURIComponent(window.location.pathname);
    } catch(e) {
      articleKey = window.location.pathname;
    }

    const btn = container.querySelector(".j-like-btn");
    const heart = container.querySelector(".j-like-heart");
    const countEl = container.querySelector(".j-like-count");

    let currentLikes = 0;
    let pendingCount = 0;
    let syncTimer = null;

    // ボタンのホバー・クリックアニメーション
    btn.onmouseover = () => { btn.style.backgroundColor = "#fff5f7"; btn.style.transform = "translateY(-2px)"; };
    btn.onmouseout = () => { btn.style.backgroundColor = "#ffffff"; btn.style.transform = "translateY(0)"; };
    btn.onmousedown = () => { btn.style.transform = "scale(0.94)"; };
    btn.onmouseup = () => { btn.style.transform = "translateY(-2px)"; };

    // 初回読み込み（現在のカウント取得）
    fetch(`${GAS_API_URL}?url=${encodeURIComponent(articleKey)}&action=get`)
      .then(res => res.json())
      .then(data => {
        currentLikes = Number(data.count) || 0;
        countEl.innerText = currentLikes;
      })
      .catch(() => {
        countEl.innerText = 0;
      });

    // クリック・note風連打処理
    btn.onclick = function () {
      currentLikes++;
      pendingCount++;
      countEl.innerText = currentLikes;

      heart.style.transform = "scale(1.4)";
      setTimeout(() => { heart.style.transform = "scale(1)"; }, 120);

      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        const toSend = pendingCount;
        pendingCount = 0;
        fetch(`${GAS_API_URL}?url=${encodeURIComponent(articleKey)}&action=increment&add=${toSend}`)
          .then(res => res.json())
          .then(data => {
            if (data.count !== undefined) {
              currentLikes = Number(data.count);
              countEl.innerText = currentLikes;
            }
          })
          .catch(err => console.error("送信エラー:", err));
      }, 800);
    };
  });
})();
