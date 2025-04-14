export type User = {
  email: string;
  password: string;
};

export type UserLogged = {
  user_id: number;
  logged: boolean;
};

export type Position = {
  latitude: number;
  longitude: number;
};

export type ErrorResponse = {
  error: string;
};
