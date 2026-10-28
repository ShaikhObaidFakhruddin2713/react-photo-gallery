
import {
  useState,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
} from 'react'

import useFetchPhotos from './hooks/useFetchPhotos'

function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE':
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id]

    default:
      return state
  }
}

function App() {
  const { photos, loading, error } = useFetchPhotos()

  const [search, setSearch] = useState('')
  const [showFavourites, setShowFavourites] = useState(false)

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    () => {
      try {
        return JSON.parse(
          localStorage.getItem('favourites')
        ) || []
      } catch {
        return []
      }
    }
  )

  // Save favourites in localStorage
  useEffect(() => {
    localStorage.setItem(
      'favourites',
      JSON.stringify(favourites)
    )
  }, [favourites])

  // Handle author search
  const handleSearch = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  // Filter photos by author and favourites
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesSearch = photo.author
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFavourite =
        !showFavourites || favourites.includes(photo.id)

      return matchesSearch && matchesFavourite
    })
  }, [photos, search, showFavourites, favourites])

  if (loading) {
    return (
      <p className="mt-10 text-center text-lg">
        Loading photos...
      </p>
    )
  }

  if (error) {
    return (
      <p className="mt-10 text-center text-red-500">
        Error: {error}
      </p>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
        My Photo Gallery
      </h1>

      <p className="mb-6 text-center text-gray-600">
        Explore photos and save your favourites ❤️
      </p>

      <input
        type="text"
        placeholder="Search by author name..."
        value={search}
        onChange={handleSearch}
        className="mx-auto mb-4 block w-full max-w-md rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
      />

      <div className="mb-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setShowFavourites(false)}
          className={`rounded-lg px-5 py-2 ${
            !showFavourites
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          All Photos
        </button>

        <button
          onClick={() => setShowFavourites(true)}
          className={`rounded-lg px-5 py-2 ${
            showFavourites
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          ❤️ Show Favourites ({favourites.length})
        </button>
      </div>

      {filteredPhotos.length === 0 ? (
        <p className="mt-10 text-center text-gray-600">
          {showFavourites
            ? 'No favourite photos yet.'
            : 'No photos found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPhotos.map((photo) => {
            const isFavourite = favourites.includes(photo.id)

            return (
              <article
                key={photo.id}
                className="overflow-hidden rounded-xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={photo.download_url}
                  alt={`Photo by ${photo.author}`}
                  loading="lazy"
                  className="h-52 w-full object-cover"
                />

                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="font-medium text-gray-800">
                    {photo.author}
                  </p>

                  <button
                    onClick={() =>
                      dispatch({
                        type: 'TOGGLE_FAVOURITE',
                        id: photo.id,
                      })
                    }
                    aria-label={
                      isFavourite
                        ? 'Remove from favourites'
                        : 'Add to favourites'
                    }
                    title={
                      isFavourite
                        ? 'Remove from favourites'
                        : 'Add to favourites'
                    }
                    className="text-2xl transition hover:scale-110"
                  >
                    {isFavourite ? '❤️' : '♡'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default App
