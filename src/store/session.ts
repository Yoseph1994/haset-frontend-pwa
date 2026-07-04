import { create } from 'zustand'
import { Preferences } from '@capacitor/preferences'
import { AUTH_TOKEN_KEY, setUnauthorizedHandler } from '@/api/client'
import * as authApi from '@/api/auth'
import type { User } from '@/api/types'

type SessionStatus = 'booting' | 'authenticated' | 'unauthenticated'

interface SessionState {
  status: SessionStatus
  user: User | null
  bootstrap: () => Promise<void>
  setSession: (user: User, token: string) => Promise<void>
  refreshUser: () => Promise<void>
  clearSession: () => Promise<void>
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'booting',
  user: null,

  async bootstrap() {
    const { value: token } = await Preferences.get({ key: AUTH_TOKEN_KEY })

    if (!token) {
      set({ status: 'unauthenticated', user: null })
      return
    }

    try {
      const user = await authApi.me()
      set({ status: 'authenticated', user })
    } catch {
      await Preferences.remove({ key: AUTH_TOKEN_KEY })
      set({ status: 'unauthenticated', user: null })
    }
  },

  async setSession(user, token) {
    await Preferences.set({ key: AUTH_TOKEN_KEY, value: token })
    set({ status: 'authenticated', user })
  },

  async refreshUser() {
    if (get().status !== 'authenticated') return
    const user = await authApi.me()
    set({ user })
  },

  async clearSession() {
    await Preferences.remove({ key: AUTH_TOKEN_KEY })
    set({ status: 'unauthenticated', user: null })
  },
}))

setUnauthorizedHandler(() => {
  void useSessionStore.getState().clearSession()
})
