// 如果之後要更動 API URL，我們可以直接修改這裡的常數(const)，而不用到程式碼裡一一尋找。在寫程式的時候，要注意怎樣的寫法會是未來比較易於維護的。
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || []

const dataPanel = document.querySelector("#data-panel")

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
              <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
    </div>
  `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  // send request to show api
  axios.get(INDEX_URL + id).then(function (response) {
    const data = response.data.results

    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src=
    "${POSTER_URL + data.image}"
              alt="Movie Poster" class="img-fluid">`
  })
}

function removeFromFavorite(id) {
  // 防止傳入的 id 在收藏清單中不存在 || 收藏清單是空的，直接return的意思就是直接結束函式的執行
  if (!movies || !movies.length) return
  // 透過id找到要刪除電影的index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  // 刪除該筆電影
  movies.splice(movieIndex, 1)
  // 存回local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  // 更新頁面
  renderMovieList(movies)
}
// listen to data panel
dataPanel.addEventListener("click", function onPanelClick(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

// 將搜尋結果重新輸出至頁面
renderMovieList(movies)