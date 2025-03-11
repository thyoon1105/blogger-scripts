function initPager() {
  console.log('Script loaded successfully');

  // RSS 피드 가져오기
  function fetchRSSFeed(url) {
    return fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
      headers: {
        'Origin': 'https://thyoon1105.github.io'
      }
    })
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .catch(error => console.error('RSS fetch error:', error));
  }

  // RSS 데이터 처리
  function processRSS() {
    const rssUrl = 'https://www.jimmycheung.ca/feeds/posts/default?max-results=9999';
    fetchRSSFeed(rssUrl).then(xml => {
      console.log('RSS fetched successfully');

      const items = xml.querySelectorAll('item');
      const posts = Array.from(items).map(item => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toUTCString();
        const date = new Date(pubDate).toISOString();
        return { title, link, date };
      });
      console.log('Parsed posts:', posts.length, posts);

      if (posts.length > 0) {
        // 날짜 기반 최신순 정렬
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Sorted posts:', posts);

        // 오래된 5개 제외 (최소 1개는 남김)
        const postsToShow = posts.length > 5 ? posts.slice(0, -5) : posts;
        console.log('Posts to Show:', postsToShow.length, postsToShow);

        // DOM에 삽입
        const container = document.querySelector('.blog-posts.hfeed, .blog-posts');
        if (container) {
          container.innerHTML = '';
          postsToShow.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-outer';
            postElement.innerHTML = `<h3><a href="${post.link}">${post.title}</a></h3><p>Date: ${new Date(post.date).toLocaleDateString()}</p>`;
            container.appendChild(postElement);
          });
          console.log('Posts inserted into container');
        } else {
          console.error('No valid container found:', '.blog-posts.hfeed, .blog-posts');
        }

        // Pager 숨김
        const pager = document.getElementById('blog-pager');
        if (pager) {
          pager.style.display = 'none';
          console.log('Pager hidden');
          const pagerObserver = new MutationObserver(() => {
            if (getComputedStyle(pager).display !== 'none') {
              pager.style.display = 'none';
              console.log('Pager re-hidden due to DOM change');
            }
          });
          pagerObserver.observe(pager, { attributes: true, childList: true, subtree: true });
        } else {
          console.warn('Pager element not found');
        }
      } else {
        console.warn('No posts found in RSS feed');
      }
    });
  }

  // "More Listings" 링크 감지 및 URL 설정
  function attachPagerListener() {
    const pagerLink = document.querySelector('#blog-pager .blog-pager-older-link') || document.querySelector('a.blog-pager-older-link');
    if (pagerLink && !pagerLink.dataset.listenerAttached) {
      console.log('Pager link found:', pagerLink);

      let baseUrl = window.location.pathname.includes('/search') ? window.location.pathname : '/';
      let updatedMax = new Date().toISOString(); // RSS로 대체하므로 임시 값
      const updatedUrl = `${baseUrl}?updated-max=${encodeURIComponent(updatedMax)}&max-results=9999`;
      pagerLink.href = updatedUrl;
      console.log('Set pager link href:', updatedUrl);

      pagerLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Pager link clicked:', this.href);
        window.location.href = this.href;
        processRSS(); // 페이지 이동 후 RSS 재처리
      });
      pagerLink.dataset.listenerAttached = 'true';
    } else if (!pagerLink) {
      console.warn('Pager link not found yet');
    }
  }

  // 초기 실행
  attachPagerListener();
  processRSS(); // 초기 페이지 로드 시 RSS 처리

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      processRSS();
      attachPagerListener();
    });
  } else {
    processRSS();
    attachPagerListener();
  }

  // DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      processRSS();
      attachPagerListener();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// 스크립트 실행
initPager();
