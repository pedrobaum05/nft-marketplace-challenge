
import { http, HttpResponse } from "msw"

import type { Session, User } from "@/types"

interface StoredUser extends User {
  password: string
}

const USERS_STORAGE_KEY = "nft-marketplace:mock-users"
const SESSION_STORAGE_KEY = "nft-marketplace:mock-session"

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isUser(value: unknown): value is User {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (typeof value.avatarUrl === "string" || value.avatarUrl === null) &&
    typeof value.createdAt === "string"
  )
}

function isStoredUser(value: unknown): value is StoredUser {
  return (
    isUser(value) &&
    isRecord(value) &&
    typeof value.password === "string"
  )
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.accessToken === "string" &&
    typeof value.expiresAt === "string" &&
    isUser(value.user)
  )
}

function readUsers(): StoredUser[] {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)

    if (!storedUsers) {
      return []
    }

    const parsedUsers: unknown = JSON.parse(storedUsers)

    if (!Array.isArray(parsedUsers)) {
      return []
    }

    return parsedUsers.filter(isStoredUser)
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function readSession(): Session | null {
  try {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY)

    if (!storedSession) {
      return null
    }

    const parsedSession: unknown = JSON.parse(storedSession)

    return isSession(parsedSession) ? parsedSession : null
  } catch {
    return null
  }
}

function saveSession(session: Session): void {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify(session),
  )
}

function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }
}

function createSession(user: StoredUser): Session {
  const session: Session = {
    accessToken: `mock-token-${crypto.randomUUID()}`,
    user: toPublicUser(user),
    expiresAt: new Date(
      Date.now() + SESSION_DURATION_MS,
    ).toISOString(),
  }

  saveSession(session)

  return session
}

export  function getActiveSession(): Session | null {
  const session = readSession()

  if (!session) {
    return null
  }

  const expirationDate = new Date(session.expiresAt).getTime()

  if (
    !Number.isFinite(expirationDate) ||
    expirationDate <= Date.now()
  ) {
    clearSession()
    return null
  }

  return session
}

export const authHandlers = [
  http.post("/api/auth/register", async ({ request }) => {
    const body: unknown = await request.json()

    if (!isRecord(body)) {
      return HttpResponse.json(
        { message: "Dados de cadastro inválidos." },
        { status: 400 },
      )
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : ""

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : ""

    const password =
      typeof body.password === "string" ? body.password : ""

    if (!name || !email.includes("@") || password.length < 8) {
      return HttpResponse.json(
        {
          message:
            "Informe nome, e-mail válido e senha com pelo menos 8 caracteres.",
        },
        { status: 400 },
      )
    }

    const users = readUsers()

    const existingUser = users.some(
      (user) => user.email.toLowerCase() === email,
    )

    if (existingUser) {
      return HttpResponse.json(
        { message: "Este e-mail já está cadastrado." },
        { status: 409 },
      )
    }

    const newUser: StoredUser = {
      id: `user-${crypto.randomUUID()}`,
      name,
      email,
      password,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    }

    saveUsers([...users, newUser])

    const session = createSession(newUser)

    return HttpResponse.json(session, { status: 201 })
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body: unknown = await request.json()

    if (!isRecord(body)) {
      return HttpResponse.json(
        { message: "Dados de login inválidos." },
        { status: 400 },
      )
    }

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : ""

    const password =
      typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return HttpResponse.json(
        { message: "Informe e-mail e senha." },
        { status: 400 },
      )
    }

    const users = readUsers()

    const user = users.find(
      (storedUser) =>
        storedUser.email.toLowerCase() === email &&
        storedUser.password === password,
    )

    if (!user) {
      return HttpResponse.json(
        { message: "E-mail ou senha incorretos." },
        { status: 401 },
      )
    }

    const session = createSession(user)

    return HttpResponse.json(session, { status: 200 })
  }),

  http.get("/api/auth/session", () => {
    const session = getActiveSession()

    if (!session) {
      return HttpResponse.json(
        { message: "Sessão não encontrada ou expirada." },
        { status: 401 },
      )
    }

    return HttpResponse.json(session, { status: 200 })
  }),

  http.post("/api/auth/logout", () => {
    clearSession()

    return HttpResponse.json(
      { success: true },
      { status: 200 },
    )
  }),
]
