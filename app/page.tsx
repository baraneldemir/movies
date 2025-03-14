"use client";

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
}

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Load watched movies from localStorage on page load
  useEffect(() => {
    const storedMovies = localStorage.getItem('watchedMovies');
    if (storedMovies) {
      setWatchedMovies(JSON.parse(storedMovies));
    }
  }, []);

  // Save watched movies to localStorage when updated
  useEffect(() => {
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  const searchMovies = async (e: FormEvent) => {
    e.preventDefault();
    if (!query) return;

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;

    try {
      const res = await axios.get<{ results: Movie[] }>(url);
      setMovies(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  // Add movie to watched list
  const handleWatchMovie = (title: string) => {
    if (!watchedMovies.includes(title)) {
      setWatchedMovies([...watchedMovies, title]);
    }
  };

  // Delete movie from watched list
  const handleDeleteMovie = (title: string) => {
    setWatchedMovies(watchedMovies.filter((movie) => movie !== title));
  };

  // Toggle sidebar visibility on small screens
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Sort watched movies alphabetically
  const sortWatchedMovies = () => {
    const sortedMovies = [...watchedMovies].sort();
    setWatchedMovies(sortedMovies);
  };

  return (
    <div className="min-h-screen bg-blue-700 flex flex-col md:flex-row">
      {/* Hamburger Menu for Small Screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-4 text-white bg-sky-900 fixed top-4 left-4 z-40 rounded-full shadow-lg focus:outline-none"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`w-full sm:w-1/4 bg-gray-900 text-white p-4 max-h-screen overflow-y-auto fixed top-0 left-0 z-50 h-screen transition-transform ease-in-out duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-white text-2xl"
          aria-label="Close sidebar"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Watched Movies ({watchedMovies.length})
        </h2>
        <button
          onClick={sortWatchedMovies}
          className="mb-4 w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
        >
          Sort Alphabetically
        </button>
        <ul className="space-y-2">
          {watchedMovies.map((title, index) => (
            <li key={index} className="p-2 bg-gray-800 rounded-lg flex justify-between items-center">
              <span>{title}</span>
              <button
                onClick={() => handleDeleteMovie(title)}
                className="ml-4 text-red-500 hover:text-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <form
          onSubmit={searchMovies}
          className="w-full max-w-md bg-white shadow-md rounded-lg p-6"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-900"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-sky-900 text-white p-3 rounded-lg hover:bg-blue-950 transition"
          >
            Maka Pakala
          </button>
        </form>

        <ul className="mt-6 w-full max-w-md space-y-4">
          {movies.map((movie) => (
            <li
              key={movie.id}
              onClick={() => handleWatchMovie(movie.title)} // Add to watched list on click
              className={`cursor-pointer p-4 text-black bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition flex gap-4`}
            >
              {/* Movie Poster */}
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="w-24 h-36 object-cover rounded-lg"
                />
              )}
              {/* Movie Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-sm text-gray-600">
                  Release Date: {movie.release_date || 'Unknown'}
                </p>
                <p className="mt-2 text-sm text-gray-800 line-clamp-3">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
