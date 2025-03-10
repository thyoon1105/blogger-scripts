document.addEventListener('DOMContentLoaded', function() {
  console.log('Script loaded successfully'); // 로드 확인
  var pagerLink = document.querySelector('#blog-pager .blog-pager-older-link');
  var initialPosts = Array.from(document.querySelectorAll('.blog-post.hentry')); // 초기 포스트 배열로 변환

  if (pagerLink) {
    pagerLink.addEventListener('click', function(e) {
      console.log('Pager link clicked'); // 클릭 확인
      fetchAndLoadAllPosts(this.href, initialPosts);
      e.preventDefault(); // 기본 링크 동작 방지
    });
  } else {
    console.error('Pager link not found');
  }

  function fetchAndLoadAllPosts(url, initialPosts) {
    console.log('Fetching URL:', url); // fetch URL 확인
    fetch(url)
      .then(response => {
        console.log('Fetch response status:', response.status); // 상태 확인
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        console.log('Fetch response received'); // 응답 확인
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newPosts = Array.from(doc.querySelectorAll('.blog-post.hentry')); // 새 포스트 배열로 변환
        console.log('New Posts found:', newPosts.length); // 새 포스트 수 확인

        // 초기 포스트와 새 포스트 통합 (중복 제거)
        const allPostsSet = new Set([...initialPosts, ...newPosts]);
        let allPosts = Array.from(allPostsSet);

        // 디버깅: allPosts와 포스트 수 확인
        console.log('All Posts:', allPosts);
        console.log('Total Posts:', allPosts.length);

        // 타임스탬프 기반으로 최신순 정렬
        allPosts = allPosts.sort((a, b) => {
          // 다양한 날짜 태그 시도
          const dateAElement = a.querySelector('time[datetime]') || a.querySelector('.date') || a.querySelector('.post-meta time') || a.querySelector('.published');
          const dateBElement = b.querySelector('time[datetime]') || b.querySelector('.date') || b.querySelector('.post-meta time') || b.querySelector('.published');
          
          const dateA = dateAElement 
            ? new Date(dateAElement.getAttribute('datetime') || dateAElement.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0])
            : new Date(0);
          const dateB = dateBElement 
            ? new Date(dateBElement.getAttribute('datetime') || dateBElement.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0])
            : new Date(0);

          console.log('Date A:', dateA, 'Element:', dateAElement?.outerHTML, 'Date B:', dateB, 'Element:', dateBElement?.outerHTML);
          return dateB - dateA; // 최신순 정렬
        });

        const postsToShow = allPosts.length > 5 ? allPosts.slice(0, -5) : allPosts;
        console.log('Posts to Show:', postsToShow);

        const container = document.querySelector('.blog-posts.hfeed');
        if (!container) {
          throw new Error('Container .blog-posts.hfeed not found');
        }
        container.innerHTML = '';

        postsToShow.forEach(post => {
          container.appendChild(post.cloneNode(true));
        });

        const pager = document.getElementById('blog-pager');
        if (pager) {
          pager.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        alert('포스트를 로드하는 데 실패했습니다. 다시 시도해 주세요.');
      });
  }
});
