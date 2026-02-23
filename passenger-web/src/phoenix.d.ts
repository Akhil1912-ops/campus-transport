declare module 'phoenix' {
  export class Socket {
    constructor(url: string, opts?: { params?: Record<string, string> })
    connect(): void
    disconnect(): void
    channel(topic: string, params?: object): Channel
  }

  export class Channel {
    join(): Push
    leave(): void
    on(event: string, callback: (payload: any) => void): void
    push(event: string, payload?: object): Push
  }

  export class Push {
    receive(status: string, callback: (payload?: any) => void): this
  }
}
