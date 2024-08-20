const API_KEY = "7773664551646c7135346878724b54"; // API_KEY
const $searchIcon = document.querySelector(".search-icon"); // 검색아이콘
const $search = document.querySelector(".search"); // input 태그
const $buttons = document.querySelectorAll('button[data-cate]'); // data-cate 속성이 있는 모든 button 태그

const $listCon = document.querySelector(".listCon"); 
const $pref = document.querySelector("#pref"); // select 태그

// url 정의
let url = new URL(
  `http://openapi.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/1/90`
);

// API 가져오는 함수
const fetchData = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayData(data.culturalEventInfo.row);
  } catch (e) {
    console.error("API 요청에 실패했습니다.", e);
  }
};

// api 내용 가져오는 함수
const displayData = (data) => {
  $listCon.innerHTML = "";

  const uniqueCategories = new Set();

  data.forEach((e) => {
    const listItem = document.createElement("li");

    // item
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

    // 카테고리가 중복되지 않도록 확인 후 option에 추가
    if (!uniqueCategories.has(e.CODENAME)) {
      uniqueCategories.add(e.CODENAME);
      const opt = document.createElement("option");
      opt.value = e.CODENAME;
      opt.textContent = e.CODENAME;
      $pref.appendChild(opt);
    }

    $listCon.appendChild(listItem);
  });
};

$buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-cate');
    filterByCategory(category);
  });
});


// 카테고리별로 데이터를 필터링하는 함수
const filterByCategory = async (category) => {
  const data = await fetchData();

  if (Array.isArray(data)) {
    const filteredData = data.filter(e => e.CODENAME === category);
    displayData(filteredData);
  }
};

// $searchIcon.addEventListener("click", (e) => {
//   console.log($search.value);
// });


// 함수 실행
fetchData().then(displayData);