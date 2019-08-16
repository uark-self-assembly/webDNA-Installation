import { User } from '../user/user';

export class AuthenticationResponse {
  user: User;
  token: string;
}
