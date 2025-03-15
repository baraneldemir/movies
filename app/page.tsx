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

interface Category {
  id: number;
  name: string;
}

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [addedMovieTitle, setAddedMovieTitle] = useState<string>(''); 
  const [addedMovieId, setAddedMovieId] = useState<number | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState<boolean>(true); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Track selected category

  useEffect(() => {
    const storedMovies = localStorage.getItem('watchedMovies');
    if (storedMovies) {
      setWatchedMovies(JSON.parse(storedMovies));
    }

    const fetchCategories = async () => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
      try {
        const res = await axios.get<{ genres: Category[] }>(url);
        setCategories(res.data.genres);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

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
      console.error('Failed to fetch movies:', err);
    }

    setCategoriesExpanded(false);
  };

  const fetchMoviesByCategory = async (categoryId: number, categoryName: string) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${categoryId}`;
  
    try {
      const res = await axios.get<{ results: Movie[] }>(url);
      setMovies(res.data.results);
      setCategoriesExpanded(false); // Collapse categories after selecting a category
      setSelectedCategory(categoryName); // Set selected category name
    } catch (err) {
      console.error('Failed to fetch category movies:', err);
    }
  };

  const handleWatchMovie = (title: string, id: number) => {
    if (!watchedMovies.includes(title)) {
      setWatchedMovies([...watchedMovies, title]);
      setAddedMovieTitle(title);
      setAddedMovieId(id);

      setTimeout(() => {
        setAddedMovieId(null);
      }, 2000);
    }
  };

  const handleDeleteMovie = (title: string) => {
    setWatchedMovies(watchedMovies.filter((movie) => movie !== title));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sortWatchedMovies = () => {
    const sortedMovies = [...watchedMovies].sort();
    setWatchedMovies(sortedMovies);
  };

  const toggleCategories = () => {
    setCategoriesExpanded(!categoriesExpanded);
  };

  return (
    <div className="min-h-screen bg-sky-800 flex flex-col md:flex-row">
      {/* Hamburger Menu for Small Screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-4 text-white bg-sky-800 fixed top-4 left-4 z-30 rounded-md shadow-lg focus:outline-none"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 h-full bg-gray-900 text-white p-6 overflow-y-auto fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:static md:h-screen md:translate-x-0 md:w-1/4`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 text-white text-2xl md:hidden"
          aria-label="Close sidebar"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Watched Movies ({watchedMovies.length})
        </h2>
        <button
          onClick={sortWatchedMovies}
          className="mb-4 w-full bg-sky-900 text-white p-2 rounded-lg hover:bg-sky-950 transition"
        >
          Sort Alphabetically
        </button>
        <ul className="space-y-2">
          {watchedMovies.map((title, index) => (
            <li key={index} className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-20">
        <form
          onSubmit={searchMovies}
          className="w-full max-w-md bg-white shadow-lg rounded-lg p-6"
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
            Search
          </button>
        </form>

        {/* Categories */}
        {categories.length > 0 && !query && (
          <div className="mt-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <button
              onClick={toggleCategories}
              className="bg-sky-900 text-white p-2 rounded-lg hover:bg-sky-950 transition w-full"
            >
              {categoriesExpanded ? 'Collapse Categories' : 'Expand Categories'}
            </button>
            {categoriesExpanded && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => fetchMoviesByCategory(category.id, category.name)} // Pass category name
                    className="bg-sky-900 text-white p-3 rounded-lg hover:bg-sky-950 transition"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Category */}
        {selectedCategory && (
          <div className="mt-6 w-full max-w-md text-white text-center">
            <h4 className="text-xl font-semibold">Top {selectedCategory} Movies by MAKA PAKA</h4>
            <h1 className="text-xs">Influenced by the algorithm that I wrote in 2 hours.</h1>

          </div>
        )}

        {/* Movie List */}
        <ul className="mt-6 w-full max-w-md space-y-4">
          {movies.map((movie) => (
            <li
              key={movie.id}
              onClick={() => handleWatchMovie(movie.title, movie.id)}
              className={`cursor-pointer p-4 text-black bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-gray-100 transition flex gap-4 relative ${
                addedMovieId === movie.id ? 'bg-green-100' : ''
              }`}
            >
              {/* Movie Poster */}
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
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

              {/* Green Checkmark Overlay Animation */}
              {addedMovieId === movie.id && (
                <div className="absolute inset-0 bg-green-500 opacity-50 flex justify-center items-center text-white text-4xl font-bold animate-checkmark">
                  ✔
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
