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
  }

  function fetchAndLoadAllPosts(url, initialPosts) {
    console.log('Fetching URL:', url); // fetch URL 확인
    fetch(url)
      .then(response => {
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

        // 타임스탬프 기반으로 최신순 정렬 (포스트 구조에 맞게 수정)
        allPosts = allPosts.sort((a, b) => {
          // 포스트에서 날짜 추출 (다양한 태그 시도)
          const dateAElement = a.querySelector('time[datetime]') || a.querySelector('.date') || a.querySelector('.post-meta time');
          const dateBElement = b.querySelector('time[datetime]') || b.querySelector('.date') || b.querySelector('.post-meta time');
          
          const dateA = dateAElement 
            ? new Date(dateAElement.getAttribute('datetime') || dateAElement.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0])
            : new Date(0); // 날짜 없으면 최소값
          const dateB = dateBElement 
            ? new Date(dateBElement.getAttribute('datetime') || dateBElement.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0])
            : new Date(0);

          console.log('Date A:', dateA, 'Element:', dateAElement, 'Date B:', dateB, 'Element:', dateBElement); // 디버깅
          return dateB - dateA; // 최신순 정렬
        });

        // 포스트가 5개 이상일 경우 가장 오래된 5개를 제외
        const postsToShow = allPosts.length > 5 ? allPosts.slice(0, -5) : allPosts;

        // 디버깅: 표시할 포스트 확인
        console.log('Posts to Show:', postsToShow);

        // 기존 포스트 컨테이너 초기화
        const container = document.querySelector('.blog-posts.hfeed');
        if (!container) {
          throw new Error('Container .blog-posts.hfeed not found');
        }
        container.innerHTML = '';

        // 포스트 추가
        postsToShow.forEach(post => {
          container.appendChild(post.cloneNode(true));
        });

        // 페이저 숨김
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
