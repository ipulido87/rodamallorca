export type Difficulty = 'Fácil' | 'Medio' | 'Difícil' | 'Épica'

export interface CyclingRoute {
  id: string
  name: string
  subtitle: string
  distance: string
  elevation: string
  duration: string
  difficulty: Difficulty
  bikeType: string
  color: string
  mapCenter: [number, number]
  zoom: number
  coords: [number, number][]
  komootUrl: string
}
