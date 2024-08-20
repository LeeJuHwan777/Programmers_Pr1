const API_KEY = "7773664551646c7135346878724b54"; // API_KEY
const $searchIcon = document.querySelector(".search-icon"); // 검색아이콘
const $search = document.querySelector(".search"); // input 태그
const $buttons = document.querySelectorAll('button[data-cate]'); // data-cate 속성이 있는 모든 button 태그
const $listCon = document.querySelector(".listCon"); // ul 부분
const $pref = document.querySelector("#pref"); // select 태그

let currentPage = 1;
let totalDataNum = 0;
let currentCategory = '';
let pageSize = 9;
let groupSize = window.innerWidth <= 900 ? 5 : 10;
let currentTitle = '';
let currentDate = '';

// API 가져오는 함수
const fetchData = async (category = "", title = "", date = "", pageNum = 1) => {
  const start = (pageNum - 1) * pageSize + 1;
  const end = start + pageSize - 1;
  let url = new URL(
    `http://openapi.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/${start}/${end}`
  );

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.culturalEventInfo && data.culturalEventInfo.row) {
      totalDataNum = data.culturalEventInfo.list_total_count; // 총 데이터 개수 업데이트
      return data.culturalEventInfo.row;
    } else {
      console.error("데이터 구조가 예상과 다릅니다.", data);
      return [];
    }
  } catch (e) {
    console.error("API 요청에 실패했습니다.", e);
    return [];
  }
};

// 데이터를 화면에 표시하는 함수
const displayData = (data) => {
  $listCon.innerHTML = "";
  $pref.innerHTML = ""; // 기존 옵션 초기화

  const uniqueCategories = new Set();

  $buttons.forEach(button => {
    const category = button.getAttribute('data-cate');
    if (!uniqueCategories.has(category) && category !== "전체") {
      uniqueCategories.add(category);
      const opt = document.createElement("option");
      opt.value = category;
      opt.textContent = category;
      $pref.appendChild(opt);
    }
  });

  data.forEach((e) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
        <div class="main-first"><img src="${
          e.MAIN_IMG || "/img/noimage.jpg"
        }" alt=""></div>
            <div class="main-content">
                <p class="title">${e.TITLE}</p>
                <p class="place">장소 ${e.PLACE}</p>
                <p class="date">${e.DATE}</p>
            </div>
        `;

    listItem.addEventListener("click", () => {
      window.open(e.HMPG_ADDR, "_blank");
    });

    $listCon.appendChild(listItem);
  });
  pagination(); // 데이터를 표시한 후 페이지네이션을 생성
};

// 페이지네이션을 생성하는 함수
const pagination = () => {
  const currentPageGroup = Math.ceil(currentPage / groupSize);
  const endPage = Math.ceil(totalDataNum / pageSize);
  const currentGroupFirstPage = (currentPageGroup - 1) * groupSize + 1;
  const currentGroupLastPage = Math.min(endPage, currentPageGroup * groupSize);
  const prevGroupFirst = (currentPageGroup - 2) * groupSize + 1;
  const nextGroupFirst = currentPageGroup * groupSize + 1;

  let html = `
  <button class="prevGroup" ${currentPageGroup === 1 ? 'disabled' : ''} onClick="movePage(${prevGroupFirst})"><<</button>
  `;

  html += `
  <button class="prevPage" ${currentPage === 1 ? 'disabled' : ''} onClick="movePage(${currentPage - 1})"><</button>
  `;

  for (let i = currentGroupFirstPage; i <= currentGroupLastPage; i++) {
    html += `
      <button class="${i === currentPage ? 'on' : ''}" onClick="movePage(${i})">${i}</button>
    `;
  }

  html += `
  <button class="nextPage" ${currentPage >= endPage ? 'disabled' : ''} onClick="movePage(${currentPage + 1})">></button>
  `;

  html += `
  <button class="nextGroup" ${currentPageGroup * groupSize >= endPage ? 'disabled' : ''} onClick="movePage(${nextGroupFirst})">>></button>
  `;

  document.querySelector('.main-second').innerHTML = html;
};

// 버튼별로 클릭 이벤트를 추가하는 부분
$buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const category = button.getAttribute('data-cate');
    
    if (category === "전체") {
      // 전체 버튼을 클릭했을 때는 전체 데이터를 가져와서 표시
      const data = await fetchData();
      displayData(data);
    } else {
      // 특정 카테고리를 클릭했을 때는 해당 카테고리로 필터링
      filterByCategory(category);
    }
  });
});


// select 태그에서 옵션을 선택했을 때 해당 카테고리로 필터링
$pref.addEventListener('change', (e) => {
  const selectedCategory = e.target.value;
  filterByCategory(selectedCategory);
});


// 카테고리별로 데이터를 필터링하는 함수
const filterByCategory = async (category) => {
  const data = await fetchData(); // 데이터를 가져옴

  // 데이터가 존재하는지 확인하고 필터링
  if (Array.isArray(data)) {
    const filteredData = data.filter(item => item.CODENAME === category); // 카테고리로 필터링
    displayData(filteredData); // 필터링된 데이터를 화면에 표시
  } else {
    console.error("데이터가 배열이 아닙니다.", data);
  }
};


// 검색어로 데이터를 필터링하는 함수
const filterBySearch = async (query) => {
  const data = await fetchData(); // 데이터를 가져옴

  // 데이터가 존재하는지 확인하고 필터링
  if (Array.isArray(data)) {
    const filteredData = data.filter(item => 
      item.TITLE.includes(query)
    ); // 제목에 검색어가 포함된 항목을 필터링
    displayData(filteredData); // 필터링된 데이터를 화면에 표시
  } else {
    console.error("데이터가 배열이 아닙니다.", data);
  }
};

// 페이지 이동을 처리하는 함수
const movePage = async (pageNum) => {
  currentPage = pageNum;
  const data = await fetchData(currentCategory, currentTitle, currentDate, pageNum);
  displayData(data);
};


// 검색 버튼을 클릭했을 때 검색어로 필터링
$searchIcon.addEventListener("click", () => {
  const query = $search.value.trim();
  if (query) {
    filterBySearch(query);
  }
});

// Enter 키를 눌렀을 때 검색이 가능하도록 처리
$search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = $search.value.trim();
    if (query) {
      filterBySearch(query);
    }
  }
});

// 카테고리 버튼 클릭 시 필터링
$buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-cate');
    filterByCategory(category);
  });
});

// 초기 데이터 로드 및 페이지네이션 설정
fetchData().then(data => {
  displayData(data);
});
