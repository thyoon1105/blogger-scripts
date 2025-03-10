function initPager() {
  console.log('Script loaded successfully');

  // /search 페이지에서 섹션 숨김
  if (window.location.pathname.startsWith('/search')) {
    const sectionsToHide = [
      '#intro-wrap',
      '#intro-author-wrap',
      '#intro-services-wrap',
      '#testimonial-wrap'
    ];
    sectionsToHide.forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        section.style.display = 'none';
        console.log(`Hid section on /search: ${selector}`);
      }
    });

    const contentWrapper = document.querySelector('#content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.display = 'block';
      console.log('Content wrapper displayed on /search');
    }
  }

  // "More Listings" 링크 감지 함수
  function attachPagerListener() {
    const pagerLink = document.querySelector('#blog-pager .blog-pager-older-link') || document.querySelector('a.blog-pager-older-link');
    if (pagerLink && !pagerLink.dataset.listenerAttached) {
      console.log('Pager link found:', pagerLink);

      // 동적으로 href 설정
      let baseUrl = window.location.pathname.startsWith('/search') ? window.location.pathname : '/';
      let updatedMax = '';
      const lastPost = document.querySelector('.blog-posts .post:last-child .post-date.published');
      if (lastPost) {
        updatedMax = lastPost.getAttribute('datetime') || lastPost.textContent.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2}/)?.[0];
      }
      if (!updatedMax) {
        console.warn('Could not determine last post timestamp, using current date');
        updatedMax = new Date().toISOString();
      }
      const updatedUrl = `${baseUrl}?updated-max=${updatedMax}&max-results=9999`;
      pagerLink.href = updatedUrl;
      console.log('Set pager link href:', updatedUrl);

      pagerLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Pager link clicked:', this.href);
        window.location.href = updatedUrl;
      });
      pagerLink.dataset.listenerAttached = 'true'; // 중복 리스너 방지
    } else if (!pagerLink) {
      console.warn('Pager link not found yet');
    }
  }

  // 초기 실행
  attachPagerListener();

  // DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      attachPagerListener();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // /search 페이지에서 포스트 처리
  if (window.location.pathname.startsWith('/search')) {
    const allPosts = Array.from(document.querySelectorAll('.blog-post.hentry.index-post')).map(post => ({
      element: post,
      date: post.querySelector('.post-date.published')?.getAttribute('datetime') || 
            post.querySelector('.post-date.published')?.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0],
      id: post.querySelector('h3 a')?.getAttribute('href') || post.dataset.postId
    }));
    console.log('All Posts fetched:', allPosts.length, allPosts);

    // 날짜 기반 최신순 정렬
    allPosts.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      console.log('Date A:', dateA, 'Date B:', dateB);
      return dateB - dateA;
    });

    // 오래된 5개 제외 (최소 1개는 남김)
    const postsToShow = allPosts.length > 5 ? allPosts.slice(0, -5) : allPosts;
    console.log('Posts to Show:', postsToShow.length, postsToShow);

    const targetContainer = document.querySelector('.blog-posts.hfeed.index-post-wrap') || document.querySelector('.blog-posts');
    if (!targetContainer) {
      console.error('No valid container found for appending posts');
      return;
    }

    // 기존 포스트 제거 후 최신 포스트 추가
    targetContainer.innerHTML = '';
    postsToShow.forEach(post => {
      targetContainer.appendChild(post.element.cloneNode(true));
    });

    // Pager 숨김
    const pager = document.getElementById('blog-pager');
    if (pager) {
      pager.style.display = 'none';
    }
  }
}

// DOM 로드 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPager);
} else {
  initPager();
}
