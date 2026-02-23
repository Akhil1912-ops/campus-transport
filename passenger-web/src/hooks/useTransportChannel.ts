import { useEffect, useState, useRef, useCallback } from 'react'
import { Socket } from 'phoenix'
import { SOCKET_URL, CHANNEL } from '../config'

export type Auto = {
  id: string
  lat?: number
  lng?: number
  state: string
  passengerCount?: number
}

export type Buggy = {
  id: string
  lat?: number
  lng?: number
  route?: string
}

export type Passenger = {
  id: string
  lat?: number
  lng?: number
  type: 'within' | 'outside'
}

type State = {
  autos: Record<string, Auto>
  buggies: Record<string, Buggy>
  passengers: Record<string, Passenger>
}

export function useTransportChannel() {
  const [state, setState] = useState<State>({
    autos: {},
    buggies: {},
    passengers: {}
  })
  const [connected, setConnected] = useState(false)
  const [myPassengerId, setMyPassengerId] = useState<string | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const socket = new Socket(SOCKET_URL)
    socket.connect()

    const ch = socket.channel(CHANNEL, {})
    ch.on('passenger_registered', (payload: { id: string }) => {
      setMyPassengerId(payload.id)
    })

    ch.join()
      .receive('ok', (resp: { autos?: Record<string, Auto>; buggies?: Record<string, Buggy>; passengers?: Record<string, Passenger> }) => {
        setConnected(true)
        setState({
          autos: resp.autos ?? {},
          buggies: resp.buggies ?? {},
          passengers: resp.passengers ?? {}
        })
      })
      .receive('error', () => setConnected(false))

    ch.on('auto_updated', (auto: Auto) => {
      setState((s) => ({
        ...s,
        autos: { ...s.autos, [auto.id]: auto }
      }))
    })

    ch.on('buggy_updated', (buggy: Buggy) => {
      setState((s) => ({
        ...s,
        buggies: { ...s.buggies, [buggy.id]: buggy }
      }))
    })

    ch.on('passenger_added', (passenger: Passenger) => {
      setState((s) => ({
        ...s,
        passengers: { ...s.passengers, [passenger.id]: passenger }
      }))
    })

    ch.on('passenger_removed', (payload: { id: string }) => {
      setMyPassengerId((prev) => (prev === payload.id ? null : prev))
      setState((s) => {
        const next = { ...s.passengers }
        delete next[payload.id]
        return { ...s, passengers: next }
      })
    })

    channelRef.current = ch

    return () => {
      channelRef.current = null
      ch.leave()
      socket.disconnect()
    }
  }, [])

  const push = useCallback((event: string, payload: Record<string, unknown>) => {
    channelRef.current?.push(event, payload)
  }, [])

  return { state, connected, myPassengerId, setMyPassengerId, push }
}
