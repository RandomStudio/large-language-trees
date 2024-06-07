interface DefaultUserPlaintext {
  id: string;
  username: string;
  password: string;
}

export const defaultUsers: DefaultUserPlaintext[] = [
  {
    id: "default-admin-user",
    username: "admin",
    password: "123456"
  }
];
