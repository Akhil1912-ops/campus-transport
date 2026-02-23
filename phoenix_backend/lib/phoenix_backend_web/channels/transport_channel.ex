defmodule PhoenixBackendWeb.TransportChannel do
  use PhoenixBackendWeb, :channel

  @impl true
  def join("transport:app", _params, socket) do
    state = PhoenixBackend.TransportState.get_full_state()
    {:ok, %{"autos" => state.autos, "buggies" => state.buggies, "passengers" => state.passengers}, socket}
  end

  @impl true
  def handle_in("register_auto", payload, socket) do
    auto = PhoenixBackend.TransportState.upsert_auto(payload)
    socket = assign(socket, :auto_id, auto["id"])
    push(socket, "auto_registered", %{"id" => auto["id"]})
    broadcast!(socket, "auto_updated", auto)
    {:noreply, socket}
  end

  def handle_in("register_buggy", payload, socket) do
    buggy = PhoenixBackend.TransportState.upsert_buggy(payload)
    socket = assign(socket, :buggy_id, buggy["id"])
    push(socket, "buggy_registered", %{"id" => buggy["id"]})
    broadcast!(socket, "buggy_updated", buggy)
    {:noreply, socket}
  end

  def handle_in("register_passenger", payload, socket) do
    passenger = PhoenixBackend.TransportState.upsert_passenger(payload)
    socket = assign(socket, :passenger_id, passenger["id"])
    push(socket, "passenger_registered", %{"id" => passenger["id"]})
    broadcast!(socket, "passenger_added", passenger)
    {:noreply, socket}
  end

  def handle_in("location_update", %{"type" => "auto"} = payload, socket) do
    id = payload["id"] || socket.assigns[:auto_id]
    auto = PhoenixBackend.TransportState.upsert_auto(Map.merge(payload, %{"id" => id}))
    broadcast!(socket, "auto_updated", auto)
    {:noreply, socket}
  end

  def handle_in("location_update", %{"type" => "buggy"} = payload, socket) do
    id = payload["id"] || socket.assigns[:buggy_id]
    buggy = PhoenixBackend.TransportState.upsert_buggy(Map.merge(payload, %{"id" => id}))
    broadcast!(socket, "buggy_updated", buggy)
    {:noreply, socket}
  end

  def handle_in("location_update", %{"type" => "passenger"} = payload, socket) do
    id = payload["id"] || socket.assigns[:passenger_id]
    passenger = PhoenixBackend.TransportState.upsert_passenger(Map.merge(payload, %{"id" => id}))
    broadcast!(socket, "passenger_added", passenger)
    {:noreply, socket}
  end

  def handle_in("location_update", _, socket), do: {:noreply, socket}

  def handle_in("auto_pickup", payload, socket) do
    id = payload["id"] || socket.assigns[:auto_id]
    case PhoenixBackend.TransportState.set_auto_pickup(id, payload["passengerCount"] || payload["passenger_count"]) do
      nil -> :ok
      auto -> broadcast!(socket, "auto_updated", auto)
    end
    {:noreply, socket}
  end

  def handle_in("auto_drop", payload, socket) do
    id = payload["id"] || socket.assigns[:auto_id]
    case PhoenixBackend.TransportState.set_auto_drop(id) do
      nil -> :ok
      auto -> broadcast!(socket, "auto_updated", auto)
    end
    {:noreply, socket}
  end

  def handle_in("passenger_done", payload, socket) do
    id = payload["id"] || socket.assigns[:passenger_id]
    if PhoenixBackend.TransportState.remove_passenger(id) do
      broadcast!(socket, "passenger_removed", %{"id" => id})
    end
    {:noreply, socket}
  end

  def handle_in(_, _, socket), do: {:noreply, socket}

  @impl true
  def terminate(_reason, socket) do
    if id = socket.assigns[:passenger_id] do
      PhoenixBackend.TransportState.remove_passenger(id)
    end
    :ok
  end
end
