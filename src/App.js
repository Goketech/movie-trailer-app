import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import MovieCard from './components/MovieCard';
import YouTube from 'react-youtube';


function App() {

  const IMAGE_PATH = "https://image.tmdb.org/t/p/w1280"
  const API_URL = "https://api.themoviedb.org/3/"
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState({})
  const [searchKey, setSearchKey] = useState("")
  const [playTrailer, setPlayTrailer] = useState(false)
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  const fetchGenres = async () => {
    const {data: {genres}} = await axios.get(`${API_URL}/genre/movie/list`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY
      }
    })

    // setGenres(genres)
    setGenres(genres.map(genre => ({ id: genre.id, name: genre.name })))
  }
  
  const fetchMovies = async (searchKey, selectedGenre, releaseDate) => {
    const type = searchKey ? "search" : "discover"
    const {data: {results}} = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        query: searchKey,
        with_genres: selectedGenre,
        "primary_release_date.gte": releaseDate,
      }

      
    })

   
    setMovies(results)
    await selectMovie(results[0])
  }

  const fetchMovie = async (id) => {
    const {data} = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
        append_to_response: 'videos'
      }
    })

    return data
  }

  const selectMovie = async (movie) => {
    setPlayTrailer(false)
    const data = await fetchMovie(movie.id)
    setSelectedMovie(data) 
  }

  useEffect( () => {
    fetchGenres()
    fetchMovies()
  }, [])


  // 
  
  const renderGenres = (movie) => {
    return movie.genres.map(genre => genre.name).join(", ");
  };

  const renderMovies = () => (
    
    movies.map(movie => (
      <MovieCard
        key={movie.id}
        movie={movie}
        selectedMovie={selectMovie}
      />
    ))
  )

  const selectGenre = (id) => {
    setSelectedGenre(id)
    fetchMovies(searchKey, id, releaseDate)
  }

  const searchMovies = (e) => {
    e.preventDefault()
    fetchMovies(searchKey, selectedGenre, releaseDate)
   }


  const renderTrailer = () => {
    if (!selectedMovie.videos) {
      return null;
    }

    const trailer = selectedMovie.videos.results.find(vid => vid.name === 'Official Trailer')
    const key = trailer ? trailer.key : selectedMovie.videos.results[0].key

    return (
    <YouTube
      videoId={key}
      className={"youtube-container"}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          cc_load_policy: 0,
          fs: 0,
          iv_load_policy: 0,
          modestbranding: 0,
          rel: 0,
          showinfo: 0,
        }
      }}
    />
      )
  }

  return (
    <div className="App">
      <header className={"header"}>
        <div className={"header-content max-center"}>
          <span>Movie Trailer App</span>

          <form className="form" onSubmit={searchMovies}>
            <input className="search" type="text" onChange={(e) => setSearchKey(e.target.value)}/>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value="">Select genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
            <button className='button' type={"submit"}>Search</button>
          </form>
        </div>
      </header>

      <div className='hero' style={{backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), url('${IMAGE_PATH}${selectedMovie.backdrop_path}')`}}>
        <div className='hero-content max-center'>
          {playTrailer ? <button className={"button button--close"} onClick={()=> setPlayTrailer(false)}>Close</button> : null}
          {selectedMovie.videos && playTrailer ? renderTrailer() :  null}
          <button className={"button"} onClick={() => setPlayTrailer(true)}>Play Trailer</button>
          <h1 className={"hero-title"}>{selectedMovie.title}</h1>
          {selectedMovie.release_date ? <p>{selectedMovie.release_date}</p> : null}
          <p>Genres: {renderGenres(selectedMovie)}</p>
          {selectedMovie.overview ? <p className={"hero-overview"}>{selectedMovie.overview}</p> : null}
        </div>
          
      </div>

      <div className='container max-center'>
        {renderMovies()}
      </div>
    </div>
  );
}

export default App;


