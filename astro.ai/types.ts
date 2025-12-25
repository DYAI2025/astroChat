export interface Message {
  role: 'user' | 'model';
  text: string;
}

export enum AppState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT'
}

export interface UserProfile {
  name: string;
  sign: string;
}
