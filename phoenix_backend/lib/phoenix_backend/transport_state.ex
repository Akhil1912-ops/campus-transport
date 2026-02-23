defmodule PhoenixBackend.TransportState do
  @moduledoc """
  In-memory store for autos, buggies, and passengers.
  """
  use GenServer

  @stale_passenger_ms 15 * 60 * 1000
  @stale_vehicle_ms 5 * 60 * 1000

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, %{}, Keyword.put_new(opts, :name, __MODULE__))
  end

  def get_full_state do
    GenServer.call(__MODULE__, :get_full_state)
  end

  def upsert_auto(data) do
    GenServer.call(__MODULE__, {:upsert_auto, data})
  end

  def upsert_buggy(data) do
    GenServer.call(__MODULE__, {:upsert_buggy, data})
  end

  def upsert_passenger(data) do
    GenServer.call(__MODULE__, {:upsert_passenger, data})
  end

  def remove_passenger(id) do
    GenServer.call(__MODULE__, {:remove_passenger, id})
  end

  def set_auto_pickup(id, passenger_count) do
    GenServer.call(__MODULE__, {:auto_pickup, id, passenger_count})
  end

  def set_auto_drop(id) do
    GenServer.call(__MODULE__, {:auto_drop, id})
  end

  def cleanup_stale do
    GenServer.call(__MODULE__, :cleanup_stale)
  end

  @impl true
  def init(_) do
    state = %{
      autos: %{},
      buggies: %{},
      passengers: %{}
    }
    schedule_cleanup()
    {:ok, state}
  end

  @impl true
  def handle_call(:get_full_state, _from, state) do
    {:reply, state, state}
  end

  def handle_call({:upsert_auto, data}, _from, state) do
    id = data["id"] || data[:id] || Ecto.UUID.generate()
    auto = %{
      "id" => id,
      "lat" => data["lat"] || data[:lat],
      "lng" => data["lng"] || data[:lng],
      "state" => data["state"] || "available",
      "passengerCount" => data["passengerCount"] || data["passenger_count"] || 0,
      "lastUpdated" => System.system_time(:millisecond)
    }
    autos = Map.put(state.autos, id, auto)
    {:reply, auto, %{state | autos: autos}}
  end

  def handle_call({:upsert_buggy, data}, _from, state) do
    id = data["id"] || data[:id] || Ecto.UUID.generate()
    buggy = %{
      "id" => id,
      "lat" => data["lat"] || data[:lat],
      "lng" => data["lng"] || data[:lng],
      "route" => data["route"] || "A",
      "lastUpdated" => System.system_time(:millisecond)
    }
    buggies = Map.put(state.buggies, id, buggy)
    {:reply, buggy, %{state | buggies: buggies}}
  end

  def handle_call({:upsert_passenger, data}, _from, state) do
    id = data["id"] || data[:id] || Ecto.UUID.generate()
    # "type" in location_update means entity (passenger) — preserve within/outside from existing
    location_type = data["type"] || data[:type]
    type = case {location_type, state.passengers[id]} do
      {t, _} when t in ["within", "outside"] -> t
      {"passenger", %{"type" => existing}} when existing in ["within", "outside"] -> existing
      {_, nil} -> "within"
      {_, %{"type" => existing}} when existing in ["within", "outside"] -> existing
      _ -> "within"
    end
    passenger = %{
      "id" => id,
      "lat" => data["lat"] || data[:lat],
      "lng" => data["lng"] || data[:lng],
      "type" => type,
      "lastUpdated" => System.system_time(:millisecond)
    }
    passengers = Map.put(state.passengers, id, passenger)
    {:reply, passenger, %{state | passengers: passengers}}
  end

  def handle_call({:remove_passenger, id}, _from, state) do
    passengers = Map.delete(state.passengers, id)
    removed = Map.has_key?(state.passengers, id)
    {:reply, removed, %{state | passengers: passengers}}
  end

  def handle_call({:auto_pickup, id, passenger_count}, _from, state) do
    count = min(3, max(1, passenger_count || 1))
    case state.autos[id] do
      nil -> {:reply, nil, state}
      auto ->
        updated = Map.merge(auto, %{
          "state" => "booked",
          "passengerCount" => count,
          "lastUpdated" => System.system_time(:millisecond)
        })
        autos = Map.put(state.autos, id, updated)
        {:reply, updated, %{state | autos: autos}}
    end
  end

  def handle_call({:auto_drop, id}, _from, state) do
    case state.autos[id] do
      nil -> {:reply, nil, state}
      auto ->
        updated = Map.merge(auto, %{
          "state" => "available",
          "passengerCount" => 0,
          "lastUpdated" => System.system_time(:millisecond)
        })
        autos = Map.put(state.autos, id, updated)
        {:reply, updated, %{state | autos: autos}}
    end
  end

  def handle_call(:cleanup_stale, _from, state) do
    now = System.system_time(:millisecond)

    {passengers, pr} = Enum.reduce(state.passengers, {%{}, []}, fn {id, p}, {acc, rem} ->
      if now - (p["lastUpdated"] || 0) > @stale_passenger_ms do
        {acc, [id | rem]}
      else
        {Map.put(acc, id, p), rem}
      end
    end)

    {autos, ar} = Enum.reduce(state.autos, {%{}, []}, fn {id, a}, {acc, rem} ->
      if now - (a["lastUpdated"] || 0) > @stale_vehicle_ms do
        {acc, [id | rem]}
      else
        {Map.put(acc, id, a), rem}
      end
    end)

    {buggies, br} = Enum.reduce(state.buggies, {%{}, []}, fn {id, b}, {acc, rem} ->
      if now - (b["lastUpdated"] || 0) > @stale_vehicle_ms do
        {acc, [id | rem]}
      else
        {Map.put(acc, id, b), rem}
      end
    end)

    removed = %{"autos" => ar, "buggies" => br, "passengers" => pr}
    new_state = %{state | autos: autos, buggies: buggies, passengers: passengers}
    {:reply, removed, new_state}
  end

  @impl true
  def handle_info(:cleanup, state) do
    now = System.system_time(:millisecond)
    {autos, _} = Enum.reduce(state.autos, {state.autos, []}, fn
      {id, a}, {acc, _} ->
        if now - (a["lastUpdated"] || 0) > @stale_vehicle_ms, do: {Map.delete(acc, id), []}, else: {acc, []}
    end)
    {buggies, _} = Enum.reduce(state.buggies, {state.buggies, []}, fn
      {id, b}, {acc, _} ->
        if now - (b["lastUpdated"] || 0) > @stale_vehicle_ms, do: {Map.delete(acc, id), []}, else: {acc, []}
    end)
    {passengers, _} = Enum.reduce(state.passengers, {state.passengers, []}, fn
      {id, p}, {acc, _} ->
        if now - (p["lastUpdated"] || 0) > @stale_passenger_ms, do: {Map.delete(acc, id), []}, else: {acc, []}
    end)
    new_state = %{state | autos: autos, buggies: buggies, passengers: passengers}
    schedule_cleanup()
    {:noreply, new_state}
  end

  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, 2 * 60 * 1000)
  end
end
