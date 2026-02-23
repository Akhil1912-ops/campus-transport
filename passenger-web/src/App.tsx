import { useState, useCallback, useEffect } from 'react'
import { MapView } from './components/MapView'
import { BuggyMapView } from './components/BuggyMapView'
import { useTransportChannel } from './hooks/useTransportChannel'
import { getPosition, isSecureContext } from './utils/location'

export default function App() {
  const { state, connected, myPassengerId, setMyPassengerId, push } = useTransportChannel()
  const [showBuggies, setShowBuggies] = useState(false)
  const [step, setStep] = useState<'ask-waiting' | 'choose-location'>('ask-waiting')
  const [geolocating, setGeolocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [locationRequested, setLocationRequested] = useState(false)

  const requestLocation = useCallback(() => {
    setError(null)
    setGeolocating(true)
    setLocationRequested(true)
    getPosition()
      .then((res) => {
        if (res.ok) {
          setUserPosition({ lat: res.lat, lng: res.lng })
        } else {
          setError(res.message)
          if (myPassengerId) {
            push('passenger_done', { id: myPassengerId })
            setMyPassengerId(null)
          }
        }
      })
      .finally(() => setGeolocating(false))
  }, [myPassengerId, push, setMyPassengerId])

  const registerPassenger = useCallback(
    async (type: 'within' | 'outside') => {
      setError(null)
      setGeolocating(true)
      const res = await getPosition()
      setGeolocating(false)
      if (res.ok) {
        push('register_passenger', { lat: res.lat, lng: res.lng, type })
        setStep('ask-waiting')
      } else {
        setError(res.message)
      }
    },
    [push]
  )

  const handleGotAuto = useCallback(() => {
    if (!myPassengerId) return
    push('passenger_done', { id: myPassengerId })
    setMyPassengerId(null)
  }, [myPassengerId, push])

  useEffect(() => {
    if (!myPassengerId) return
    const interval = setInterval(async () => {
      const res = await getPosition()
      if (res.ok) {
        push('location_update', { type: 'passenger', id: myPassengerId, lat: res.lat, lng: res.lng })
      } else {
        push('passenger_done', { id: myPassengerId })
        setMyPassengerId(null)
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [myPassengerId, push, setMyPassengerId])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      {/* Map — 70% when buggies, 55% otherwise */}
      <div
        className="absolute inset-0 top-0 left-0 right-0 transition-[height] duration-300 ease-out"
        style={{ height: showBuggies ? '70%' : '55%' }}
      >
        {showBuggies ? (
          <BuggyMapView buggies={state.buggies} />
        ) : (
          <MapView
            autos={state.autos}
            buggies={state.buggies}
            passengers={state.passengers}
            showBuggies={false}
            userPosition={userPosition}
          />
        )}
      </div>

      {/* Center-on-me — only when viewing auto map */}
      {!showBuggies && (
      <button
        onClick={requestLocation}
        disabled={geolocating}
        className="absolute top-4 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-60 z-10"
        aria-label="Center on my location"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      )}

      {/* Connection indicator */}
      {!connected && (
        <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow z-10">
          Connecting…
        </div>
      )}

      {/* Bottom panel — 30% when buggies, 45% otherwise */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20 transition-[min-height] duration-300 ease-out"
        style={{ minHeight: showBuggies ? '30%' : '45%' }}
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3" />
        <div className="px-4 pt-4 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Campus Transport</h2>

          {/* Buggy mode: minimal panel */}
          {showBuggies ? (
            <div>
              <p className="text-gray-600 text-sm mb-4">Viewing buggy routes. Toggle off to see autos and passengers.</p>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                <span className="text-gray-700 font-medium">Show buggies</span>
                <input
                  type="checkbox"
                  checked={showBuggies}
                  onChange={(e) => setShowBuggies(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-500"
                />
              </label>
            </div>
          ) : (
            <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <span className="font-medium">⚠️ {error}</span>
            </div>
          )}

          {!isSecureContext() && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 text-sm font-semibold mb-1">📍 Use HTTPS</p>
              <p className="text-blue-700 text-sm mb-2">Location only works with https:// (not http://). In the address bar, type:</p>
              <code className="block text-xs bg-white p-2 rounded border border-blue-200 text-blue-800 break-all">
                https://{typeof window !== 'undefined' ? window.location.host : 'YOUR_IP:5173'}
              </code>
              <p className="text-blue-600 text-xs mt-2">Accept the certificate warning to continue.</p>
            </div>
          )}

          {!userPosition && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-sm font-medium mb-2">📍 Location needed</p>
              <p className="text-amber-700 text-sm mb-3">Tap below to enable location. Your browser will ask for permission.</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); requestLocation() }}
                disabled={geolocating || !isSecureContext()}
                className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
              >
                {geolocating ? 'Getting your location…' : (locationRequested ? 'Try again' : 'Enable location')}
              </button>
            </div>
          )}

          {step === 'ask-waiting' && !myPassengerId && userPosition && (
            <div className="space-y-3">
              <p className="text-gray-700 font-medium mb-3">Are you waiting for auto?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('choose-location')}
                  disabled={!connected || geolocating}
                  className="py-4 rounded-2xl border-2 border-green-500 bg-green-50 hover:bg-green-100 font-semibold text-gray-900 disabled:opacity-50 active:scale-[0.98]"
                >
                  Yes
                </button>
                <button
                  onClick={() => {}}
                  className="py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 font-semibold text-gray-700 active:scale-[0.98]"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {step === 'choose-location' && (
            <div className="space-y-3">
              <p className="text-gray-700 font-medium mb-3">Do you want to travel within the campus or outside the campus?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => registerPassenger('within')}
                  disabled={geolocating}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-green-500 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-lg">🏫</span>
                  </div>
                  <span className="font-medium text-gray-900">Within campus</span>
                </button>
                <button
                  onClick={() => registerPassenger('outside')}
                  disabled={geolocating}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-lg">🚪</span>
                  </div>
                  <span className="font-medium text-gray-900">Outside campus</span>
                </button>
              </div>
              <button
                onClick={() => setStep('ask-waiting')}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Back
              </button>
            </div>
          )}

          {myPassengerId && (
            <div className="space-y-3">
              <p className="text-gray-700 font-medium mb-3">Press the button below when you have taken the auto.</p>
              <button
                onClick={handleGotAuto}
                className="w-full py-4 rounded-2xl border-2 border-green-600 bg-green-600 hover:bg-green-700 text-white font-semibold active:scale-[0.98]"
              >
                I&apos;ve taken the auto
              </button>
            </div>
          )}

          <label className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <span className="text-gray-700 font-medium">Show buggies</span>
            <input
              type="checkbox"
              checked={showBuggies}
              onChange={(e) => setShowBuggies(e.target.checked)}
              className="w-5 h-5 rounded accent-amber-500"
            />
          </label>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
