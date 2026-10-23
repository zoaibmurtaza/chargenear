// Cross-tab and Supabase Realtime event bus
// Ensures instant multi-tab communication when evaluating locally or over Supabase Realtime

import { supabase, isConfigured } from './supabaseClient';

class RealtimeBus {
  constructor() {
    this.listeners = new Map();
    this.channel = null;

    // Browser BroadcastChannel for instant local cross-tab communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.bc = new BroadcastChannel('chargenear_realtime_events');
      this.bc.onmessage = (event) => {
        this.emitLocal(event.data.type, event.data.payload);
      };
    }

    // Connect Supabase Realtime channel if configured
    if (isConfigured) {
      this.channel = supabase.channel('chargenear_global_realtime')
        .on('broadcast', { event: 'chargenear_event' }, (payload) => {
          this.emitLocal(payload.type, payload.data);
        })
        .subscribe();
    }
  }

  emit(type, payload) {
    // 1. Local window listeners
    this.emitLocal(type, payload);

    // 2. BroadcastChannel to other browser tabs/windows
    if (this.bc) {
      this.bc.postMessage({ type, payload });
    }

    // 3. Supabase Realtime broadcast to remote clients
    if (this.channel && isConfigured) {
      this.channel.send({
        type: 'broadcast',
        event: 'chargenear_event',
        data: { type, payload }
      });
    }
  }

  emitLocal(type, payload) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in realtime callback for ${type}:`, e);
        }
      });
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);

    // Return un-subscribe function
    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(callback);
      }
    };
  }
}

export const realtimeBus = new RealtimeBus();
