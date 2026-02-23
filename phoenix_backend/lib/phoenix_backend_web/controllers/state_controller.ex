defmodule PhoenixBackendWeb.StateController do
  use PhoenixBackendWeb, :controller

  def show(conn, _params) do
    state = PhoenixBackend.TransportState.get_full_state()
    json(conn, state)
  end
end
