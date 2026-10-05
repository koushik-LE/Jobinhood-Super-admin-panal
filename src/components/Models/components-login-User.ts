interface User {
  role: 'admin' | 'user' | 'moderator';
  id: string;
  name: string;
  email: string;
  // add any other properties your user object has
}

export default User;
