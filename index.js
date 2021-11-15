
// 如果之後要更動 API URL，我們可以直接修改這裡的常數(const)，而不用到程式碼裡一一尋找。

const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const movies = []
const MOVIES_PER_PAGE = 12
let searchResults = []
let currentPage = 1

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const modeSwitches = document.querySelector("#modeSwitches")


// Functions

// renderMovieList card-mode

function renderMovieList(data) {

  let rawHTML = ""

  data.forEach(function (item) {
    // title, image, id
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-warning btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-dark btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
    </div>
  `
  })

  dataPanel.innerHTML = rawHTML
}

// renderMovieList list-mode

function renderMovieListForListMode(data) {

  let rawHTML = `<ul class="list-group col-sm-12 mb-4">`

  data.forEach(function (item) {
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button type="button" class="btn btn-warning btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
          <button type="button" class="btn btn-dark btn-add-favorite" data-id="${item.id}">+</button>
        </div> 
      </li> `
  })

  rawHTML += `</ul >`
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {

  const pageQuantity = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""

  // 運用三元運算子，預設第一頁為active狀態，其餘頁碼保持inactive狀態
  for (let page = 1; page <= pageQuantity; page++) {
    rawHTML += `<li class="page-item ${page === 1 ? "active" : ""}" ><a class="page-link" href="#" 
    data-page="${page}">${page}</a></li > `
  }
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {

  const data = searchResults.length ? searchResults : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {

  // 取得元素
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  //在帶入新資料前，先清除上一筆資料的殘影
  modalTitle.innerText = ""
  modalDate.innerText = ""
  modalDescription.innerText = ""
  modalImage.innerHTML = ""

  // 請求 show API
  axios.get(INDEX_URL + id).then(function (response) {

    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src = "${POSTER_URL + data.image}"
      alt = "Movie Poster" class="img-fluid" >
      `
  })
}

function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中!")
  }

  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

function changeDisplayMode(displaymode) {

  if (dataPanel.dataset.mode === displaymode) return
  dataPanel.dataset.mode = displaymode
}

// Event Listeners

dataPanel.addEventListener("click", function onPanelClick(event) {

  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))

  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {

  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()
  // !keyword.length 為字串長度為0的意思，錯誤處理: 輸入無效字串
  // if (!keyword.length) {
  //   return alert('Please key in valid string!')
  // }

  // 儲存符合篩選條件的項目
  searchResults = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (searchResults.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合的電影`)
  }

  currentPage = 1

  //重製分頁器
  renderPaginator(searchResults.length)

  //重新進行渲染
  renderMovieList(getMoviesByPage(currentPage))
})


paginator.addEventListener("click", function onPaginatorClick(event) {

  if (event.target.tagName !== "A")
    return

  const page = Number(event.target.dataset.page)
  currentPage = page

  if (event.target.tagName === "A") {

    //先選取所有有page-item這個class name的頁碼標籤，並去掉上面的active特性
    $(".page-item").removeClass("active")

    //將點擊到的頁碼加上active特性(抓的是<a> tag 的parent element)
    event.target.parentElement.classList.add("active")
  }

  //依據mode去做渲染
  if (dataPanel.dataset.mode === "card-mode") {
    renderMovieList(getMoviesByPage(currentPage))

  } else if (dataPanel.dataset.mode === "list-mode") {
    renderMovieListForListMode(getMoviesByPage(currentPage))
  }
})

//預設選取card-mode
const cardModeButton = document.querySelector("#card-mode-button")
cardModeButton.classList.add("bg-danger")

modeSwitches.addEventListener('click', function onSwitchClick(event) {

  if (event.target.matches("#card-mode-button")) {
    changeDisplayMode("card-mode")
    renderMovieList(getMoviesByPage(currentPage))
    event.target.classList.add("bg-danger")
    event.target.nextElementSibling.classList.remove("bg-danger")

  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode")
    renderMovieListForListMode(getMoviesByPage(currentPage))
    event.target.classList.add("bg-danger")
    event.target.previousElementSibling.classList.remove("bg-danger")
  }
})


// API requests
axios
  .get(INDEX_URL)
  .then(function (response) {
    for (const movie of response.data.results) {
      //此時的movie為response.data.results中一個個的物件
      movies.push(movie)
    }
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((error) => {
    console.log(error)
  })