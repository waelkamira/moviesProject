"use strict";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const PROFILE_BASE_URL = "http://image.tmdb.org/t/p/w185";
const BACKDROP_BASE_URL = "http://image.tmdb.org/t/p/w780";
const CONTAINER = document.querySelector(".container");

// Don't touch this function please
const autorun = async () => {
  const movies = await fetchMovies();
  renderMovies(movies.results);
};

// Don't touch this function please
const constructUrl = (path) => {
  return `${TMDB_BASE_URL}/${path}?api_key=${atob(
    "NTYzNjVkZjZhNTlhOWQ4Yzk3Njk3ODk5ZGJiYTkzMTM="
  )}`;
};

// You may need to add to this function, definitely don't delete it.
const movieDetails = async (movie) => {
  const movieRes = await fetchMovie(movie.id);
  renderMovie(movieRes);
};

// This function is to fetch movies. You may need to add it or change some part in it in order to apply some of the features.
const fetchMovies = async () => {
  const url = constructUrl(`movie/now_playing`);
  const res = await fetch(url);
  return res.json();
};

// Don't touch this function please. This function is to fetch one movie.
const fetchMovie = async (movieId) => {
  const url = constructUrl(`movie/${movieId}`);
  const res = await fetch(url);
  return res.json();
};

// You'll need to play with this function in order to add features and enhance the style.
const renderMovies = (movies) => {
  movies.map((movie) => {
    const movieDiv = document.createElement("div");
    if(movie.backdrop_path === null){
      return;
    } else {
      movieDiv.innerHTML = `
        <img src="${BACKDROP_BASE_URL + movie.backdrop_path}" alt="${
      movie.title
    } poster">
        <h6>${movie.title}</h6>`;
    }
    
    movieDiv.addEventListener("click", () => {
      movieDetails(movie);
    });
    CONTAINER.appendChild(movieDiv);
  });
};

// You'll need to play with this function in order to add features and enhance the style.
const renderMovie = async (movie) => {
  scrollTo(0, 0); // scroll to top of page bc so that it feels like a new page is being loaded
  const trailerData = await fetchMovieTrailer(movie.id);
  const teaserVideos = trailerData.results.filter(
    (result) => result.type === "Teaser"
  );
  const random = Math.floor(Math.random() * teaserVideos.length);
  const randomTeaserVideo = teaserVideos[random];
  const randomTeaserVideoKey = randomTeaserVideo?.key;

  CONTAINER.innerHTML = `
    <div class="">
    <h1 id="movie-title" class="text-center mb-4">${movie.title}</h1>
      <div class="row align-items-center">
        <div class="col-md-4 col-lg-8">
                <img id="movie-poster" class="img-fluid" id="movie-backdrop" src=${
                  BACKDROP_BASE_URL + movie.backdrop_path
                }>
        </div>
        <div class="col-md-8 col-lg-4">
            <p id="movie-release-date"><b>Release Date:</b> ${
              movie.release_date
            }</p>
            <p id="movie-runtime"><b>Runtime:</b> ${movie.runtime} Minutes</p>
            <hr></hr>
            <h3>Overview:</h3>
            <p id="movie-overview">${movie.overview}</p>
            <hr></hr>
            <div class="spoken-languages">
            <p>Spoken Languages:</p>
            <ul class="spoken-languages__list list-unstyled">
            ${movie.spoken_languages.map((language) => {
                return `<li><b>${language.name}</b></li>`;
              })
              .join(" | ")}
            </ul>
            <hr></hr>
        </div>
        <div class="vote-info">
            <p><b>Vote Average:</b> ${movie.vote_average.toFixed(2)}</p>
            <p><b>Vote Count:</b> ${movie.vote_count}</p>
        </div>
      </div>
    </div>
    <div class="container">
      <iframe width="100%" height="500px" src="https://www.youtube.com/embed/${randomTeaserVideoKey}">
      </iframe>
    </div>
    <div class="text-center">
      <h3>Actors</h3>
      <ul id="actors" class="list-unstyled"></ul>
    </div>
    <div class="text-center mt-5">
      <h3>Similar Movies</h3>
      <ul class="similar-movies list-unstyled"></ul>
    </div>`;
  const actors = await fetchFilmCast(movie.id);
  const similarMovies = await fetchSimilarMovies(movie.id);
  renderCasts(actors);
  renderSimilarMovies(similarMovies);
};

async function fetchFilmCast(movieId) {
  const url = constructUrl(`movie/${movieId}/credits`);
  const res = await fetch(url);
  const data = await res.json();
  const actors = data.cast
    .filter((actor) => actor.profile_path !== null) // filter out actors without a profile_path
    .map((actor) => {
      return [actor.name, actor.profile_path]; // return name and profile_path
    });
  actors.length = Math.min(actors.length, 6);
  return actors;
}
function renderCasts(actors) {
  const ul = document.getElementById("actors");
  for (const actor of actors) {
    const [actorName, profile_path] = actor;
    const actorListItem = document.createElement("li");
    actorListItem.innerHTML = renderCast(actorName, profile_path);
    actorListItem.addEventListener("click", () => {
      // RENDER CLICKED ACTOR'S PAGE
      console.log("clicked to a single actor");
    });
    ul.appendChild(actorListItem);
  }
}
function renderCast(actorName, actorProfilePath) {
  return `<div class="card card--actor">
          <img class="img-fluid" src="${PROFILE_BASE_URL}${actorProfilePath}">
          <p>${actorName}</p>
          </div>
          `;
}

async function fetchSimilarMovies(movieId) {
  const url = constructUrl(`movie/${movieId}/similar`);
  const response = await fetch(url);
  const data = await response.json();
  const similarMoviesWithImages = data.results.filter(
    (movie) => movie.backdrop_path !== null
  );
  similarMoviesWithImages.length = Math.min(similarMoviesWithImages.length, 6);
  return similarMoviesWithImages;
}
function renderSimilarMovies(similarMovies) {
  const similarMoviesList = document.querySelector(".similar-movies");
  for (const similarMovie of similarMovies) {
    similarMoviesList.appendChild(renderSimilarMovie(similarMovie));
  }
}
function renderSimilarMovie(movie) {
  const cardDiv = document.createElement("div");
  const cardBody = document.createElement("div");
  const listEl = document.createElement("li");
  const movieImg = document.createElement("img");
  const movieTitle = document.createElement("h3");
  const button = document.createElement("button");
  cardDiv.classList.add("card");
  button.classList.add("btn", "btn-primary");
  button.innerText = "See Movie Details";
  movieTitle.classList.add("card-title");
  movieTitle.innerText = movie.original_title;
  movieImg.src = BACKDROP_BASE_URL + movie.backdrop_path;
  movieImg.classList.add("img-fluid");
  cardDiv.appendChild(movieImg);
  cardBody.appendChild(movieTitle);
  cardBody.appendChild(button);
  cardDiv.appendChild(cardBody);
  listEl.appendChild(cardDiv);
  button.addEventListener("click", () => {
    movieDetails(movie);
  });
  return listEl;
}
async function fetchMovieTrailer(movieId) {
  const url = constructUrl(`movie/${movieId}/videos`);
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

document.addEventListener("DOMContentLoaded", autorun);


// ******************************my solution**************************************************
// Home nav ************************************************** Home ***************************
let home = document.querySelector('.home');
let actorsDiv = document.querySelector('.actors--page');
let actors = document.querySelector('.actors');
let actorPage = document.querySelector('.actor--page');
actorsDiv.classList.add('actorsDiv');

home.addEventListener('click', function(){

  CONTAINER.classList.remove('hidden');
  aboutDiv.classList.add('hidden');
  actorsDiv.classList.add('hidden');
  filterDiv.classList.add('hidden');
  movieGenres.classList.add('hidden');

  for(let el = 0; el <= 50; el++){
    const constructUrl = (path) => {
      return `${TMDB_BASE_URL}/${path}?api_key=${atob(
        "NTYzNjVkZjZhNTlhOWQ4Yzk3Njk3ODk5ZGJiYTkzMTM=")}&page=${el}`;
    };
    
  const fetchMovies = async () => {
    const url = constructUrl(`movie/now_playing`);
    const res = await fetch(url);
    let movies = await res.json();
    renderMovies(movies.results);
  };
  
  fetchMovies();
}
})

// Actor nav ************************************************** Actors**************************

// when the user click on Actors button 
actors.addEventListener('click', function(){
  actorsDiv.classList.remove('hidden');
  CONTAINER.classList.add('hidden');
  
  // this while loop to empty actorsDiv evry single time we click on Actors button
  if(actorsDiv !== null){
    while (actorsDiv.firstChild) {
      actorsDiv.removeChild(actorsDiv.firstChild);
    }
  }

  // this loop to loop over 10 pages of actors pages
  for(let el = 0; el <= 20; el++){
    const constructUrl = (path) => {
      return `${TMDB_BASE_URL}/${path}?api_key=${atob(
        "NTYzNjVkZjZhNTlhOWQ4Yzk3Njk3ODk5ZGJiYTkzMTM=")}&page=${el}`;
    };
    
  // this function to fetch actors
  const fetchActors = async () => {
    const url = constructUrl(`person/popular`);
    const res = await fetch(url);
    let actorNames = await res.json();

    // this for loop to loop all over the actors
    for(let i = 0; i < actorNames.results.length; i++){
      let actDiv = document.createElement('div');
      let actorImage = document.createElement('img');
      let actorName = document.createElement('h4');

      actDiv.classList.add('actDiv');
      if(actorNames.results[i].profile_path === null || actorNames.results[i].gender === 1){
        continue;
      } else {
        actorImage.src = `${BACKDROP_BASE_URL + actorNames.results[i].profile_path}`;
      }
    
      actorImage.classList.add('actor--img');
      actorName.textContent = actorNames.results[i].name;
      actDiv.appendChild(actorImage);
      actDiv.appendChild(actorName);
      actorsDiv.appendChild(actDiv);
    }
  };
  fetchActors();
}
});

// About nav **************************************************** About **************************
let about = document.querySelector('.about');
let aboutDiv = document.querySelector('.aboutDiv');
about.addEventListener('click', function(){
  movieGenres.classList.add('hidden');
  actorPage.classList.add('hidden');
  filterDiv.classList.add('hidden');
  CONTAINER.classList.add('hidden');
  actorsDiv.classList.add('hidden');
  aboutDiv.classList.remove('hidden');
})

// Genre nav   **************************************************** Genre **************************

let genreButton = document.querySelector('.genreButton');
let genres = document.querySelector('.genre');
let movieGenres = document.querySelector('.movie--genres');

// when we choose a genre from the drop-down list
genres.addEventListener('change', function(){
  console.log(genres.value);
  movieGenres.classList.remove('hidden');
  actorPage.classList.add('hidden');
  actorsDiv.classList.add('hidden');
  CONTAINER.classList.add('hidden');
  aboutDiv.classList.add('hidden');
  filterDiv.classList.add('hidden');

  //this while loop to remove the prevuse movie from the last click on Genre
  while (movieGenres.firstChild) {
    movieGenres.removeChild(movieGenres.firstChild);
  }
      
  for(let el = 0; el <= 500; el++){
    const constructUrl = (path) => {
      return `${TMDB_BASE_URL}/${path}?api_key=${atob(
        "NTYzNjVkZjZhNTlhOWQ4Yzk3Njk3ODk5ZGJiYTkzMTM=")}&page=${el}`;
    };
    
  const fetchMovies = async () => {
    const url = constructUrl(`movie/now_playing`);
    const res = await fetch(url);
    let movies = await res.json();
    renderMovies(movies.results);
    
    for(let s = 0; s < movies.results.length; s++){
      
      for(let i = 0; i < movies.results[s].genre_ids.length; i++){
        console.log(movies.results[s].genre_ids[i]);
        if(Number(genres.value) === movies.results[s].genre_ids[i]){

        let movieDiv = document.createElement('div');
        let movieImage = document.createElement('img');
        let movieName = document.createElement('h6');
        movieName.textContent = movies.results[s].title;

        if(movies.results[s].backdrop_path === null || movies.results[s].profile_path === null){
          continue;
          
        } else {
  
          if(movies.results[s].backdrop_path){
            movieImage.src = `${BACKDROP_BASE_URL + movies.results[s].backdrop_path}`;
          } else {
            movieImage.src = `${BACKDROP_BASE_URL + movies.results[s].profile_path}`;
          }
          movieDiv.appendChild(movieImage);
        }

        movieImage.classList.add('posters');
        movieDiv.appendChild(movieName);
        movieGenres.appendChild(movieDiv);
        // document.body.appendChild(movieGenres);
        }
      }
    }
  };
  
  fetchMovies();
}
})


// Filter nav ******************************************************************** filter**************************
let filterButton = document.querySelector('.filter');
let filterDiv = document.querySelector('.filterDiv');
// when the user click on filter button  
filterButton.addEventListener('change', function(){

  filterDiv.classList.remove('hidden');
  aboutDiv.classList.add('hidden');
  movieGenres.classList.add('hidden');
  actorsDiv.classList.add('hidden');
  CONTAINER.classList.add('hidden');
  actorPage.classList.add('hidden');
  // movieHome.classList.add('hidden');

  while (filterDiv.firstChild) {
    filterDiv.removeChild(filterDiv.firstChild);
  }

  // fetch all movies acording to filter
  const fetchMovies = async () => {
    const url = constructUrl(`movie/${filterButton.value}`);
    const res = await fetch(url);
    let movieList = await res.json();

    // this for loop to loop all over movies in the link 
    for(let i = 0; i < movieList.results.length; i++){
    
      let movieDiv = document.createElement('div');
      let movieName = document.createElement('h6');
      let movieImage = document.createElement('img');
      movieImage.classList.add('imgfilter');
      movieImage.src = `${BACKDROP_BASE_URL + movieList.results[i].backdrop_path}`;
      movieName.textContent = movieList.results[i].original_title;
      movieDiv.appendChild(movieImage);
      movieDiv.appendChild(movieName);
      filterDiv.appendChild(movieDiv);
      
      // when user click on a movie's img
      movieImage.addEventListener('click', function(){
        filterDiv.classList.add('hidden');
        CONTAINER.classList.remove('hidden');
        movieDiv.classList.remove('hidden');
        console.log(movieList.results[i]);
        renderMovie(movieList.results[i]);
        filterDiv.classList.remove('hidden');
        filterDiv.appendChild(movieDiv);
      })
    };
  };
  fetchMovies()
})

// search nav for searching movies *************************************** search ***********************

let search = document.querySelector('#search');
let movieHome = document.querySelector('.movieHome');
movieHome.classList.add('movieHome');

search.addEventListener('input', function(){
  aboutDiv.classList.add('hidden');
  actorsDiv.classList.add('hidden');
  CONTAINER.classList.add('hidden');
  filterDiv.classList.add('hidden');
  if(movieHome !== null){
    while (movieHome.firstChild) {
      movieHome.removeChild(movieHome.firstChild);
    }
  }
  
  const constructUrl = (path) => {
    return `${TMDB_BASE_URL}/${path}?api_key=${atob("NTYzNjVkZjZhNTlhOWQ4Yzk3Njk3ODk5ZGJiYTkzMTM=")}&query=${search.value}`;
  };

  const fetchSearchMovies = async () => {
    const url = constructUrl(`search/multi`);
    const res = await fetch(url);
    let movies = await res.json();

    for(let i = 0; i < 20; i++){
      
      let movieDiv = document.createElement('div');
      let movieImage = document.createElement('img');
      let movieName = document.createElement('h6');

      movieImage.classList.add('movieImage');
      movieName.textContent = movies.results[i].name || movies.results[i].title;

      if(movies.results[i].backdrop_path === null || movies.results[i].profile_path === null){
        continue;
  
      } else {

        if(movies.results[i].backdrop_path){
          movieImage.src = `${BACKDROP_BASE_URL + movies.results[i].backdrop_path}`;
        } else {
          movieImage.src = `${BACKDROP_BASE_URL + movies.results[i].profile_path}`;
        }
        movieDiv.append(movieImage);
      }
      
      movieDiv.append(movieName);
      movieHome.append(movieDiv);
      document.body.appendChild(movieHome);
    }
  };
  fetchSearchMovies();
});
