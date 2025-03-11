function initPager() {
  console.log('Script loaded successfully');

  // DOM 준비 후 /search 페이지 처리
  function processPage() {
    console.log('Attempting to process page');

    if (window.location.pathname.includes('/search')) {
      console.log('Processing /search page');

      // 섹션 숨김
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
          console.log(`Hid section: ${selector}`);
        }
      });

      const contentWrapper = document.querySelector('#content-wrapper');
      if (contentWrapper) {
        contentWrapper.style.display = 'block';
        console.log('Content wrapper displayed');
      }

      // 포스트 처리 (지연 적용)
      setTimeout(() => {
        const allPosts = Array.from(document.querySelectorAll('.post-outer, .post.hentry')).map(post => {
          let dateElement = post.querySelector('.date-header span, .post-timestamp, .published, time, span.timestamp-link, .published-link');
          if (!dateElement) {
            // 모든 span과 time 태그 검색 후 컨텍스트 확인
            dateElement = post.querySelector('span, time') || post.querySelector('.date');
            if (dateElement) {
              console.log('Fallback date element found:', dateElement);
            }
          }
          let date = null;
          if (dateElement) {
            date = dateElement.getAttribute('datetime') ||
                   dateElement.textContent.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?(Z|[-+]\d{2}:\d{2})|\d{4}-\d{2}-\d{2}/)?.[0] ||
                   new Date().toISOString();
            console.log(`Found date for post: ${date} in element`, dateElement);
          } else {
            console.warn('No date element found for post', post);
          }
          return {
            element: post,
            date: date,
            id: post.querySelector('h3 a')?.getAttribute('href') || post.dataset.postId
          };
        });
        console.log('All Posts fetched:', allPosts.length, allPosts);

        if (allPosts.length > 0) {
          // 날짜 기반 최신순 정렬
          allPosts.sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            console.log('Sorting - Date A:', dateA, 'Date B:', dateB);
            return dateB - dateA;
          });

          // 오래된 5개 제외 (최소 1개는 남김)
          const postsToShow = allPosts.length > 5 ? allPosts.slice(0, -5) : allPosts;
          console.log('Posts to Show:', postsToShow.length, postsToShow);

          const targetContainer = document.querySelector('.blog-posts.hfeed, .blog-posts');
          if (targetContainer) {
            targetContainer.innerHTML = '';
            postsToShow.forEach(post => {
              const clonedPost = post.element.cloneNode(true);
              targetContainer.appendChild(clonedPost);
            });
            console.log('Posts updated in container');
          } else {
            console.error('No valid container found:', '.blog-posts.hfeed, .blog-posts');
          }

          // Pager 숨김
          const pager = document.getElementById('blog-pager');
          if (pager) {
            pager.style.display = 'none';
            console.log('Pager hidden');
            // MutationObserver로 버튼 상태 지속 감지
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
          console.warn('No posts found to process');
        }
      }, 1000); // 1초 지연
    }
  }

  // "More Listings" 링크 감지 및 URL 설정
  function attachPagerListener() {
    const pagerLink = document.querySelector('#blog-pager .blog-pager-older-link') || document.querySelector('a.blog-pager-older-link');
    if (pagerLink && !pagerLink.dataset.listenerAttached) {
      console.log('Pager link found:', pagerLink);

      let baseUrl = window.location.pathname.includes('/search') ? window.location.pathname : '/';
      let updatedMax = '';
      const posts = document.querySelectorAll('.post-outer, .post.hentry');
      if (posts.length > 0) {
        const lastPost = posts[posts.length - 1];
        let dateElement = lastPost.querySelector('.date-header span, .post-timestamp, .published, time, span.timestamp-link, .published-link');
        if (!dateElement) {
          dateElement = lastPost.querySelector('span, time') || lastPost.querySelector('.date');
          if (dateElement) {
            console.log('Fallback date element found:', dateElement);
          }
        }
        updatedMax = dateElement?.getAttribute('datetime') ||
                     dateElement?.textContent.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?(Z|[-+]\d{2}:\d{2})|\d{4}-\d{2}-\d{2}/)?.[0] ||
                     new Date().toISOString();
        console.log('Last post timestamp:', updatedMax, 'from', dateElement);
      } else {
        console.warn('Could not determine last post timestamp, using current date');
        updatedMax = new Date().toISOString();
      }
      const updatedUrl = `${baseUrl}?updated-max=${encodeURIComponent(updatedMax)}&max-results=9999`;
      pagerLink.href = updatedUrl;
      console.log('Set pager link href:', updatedUrl);

      pagerLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Pager link clicked:', this.href);
        window.location.href = this.href;
      });
      pagerLink.dataset.listenerAttached = 'true';
    } else if (!pagerLink) {
      console.warn('Pager link not found yet');
    }
  }

  // 초기 실행
  attachPagerListener();

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      processPage();
      attachPagerListener();
    });
  } else {
    processPage();
    attachPagerListener();
  }

  // DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      processPage();
      attachPagerListener();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// 스크립트 실행
initPager();
