import { AuthResult } from '../types/chat';

export class AuthService {
  private user1Password: string;
  private user2Password: string;

  constructor() {
    this.user1Password = process.env.USER1_PASSWORD || 'user1pass';
    this.user2Password = process.env.USER2_PASSWORD || 'user2pass';
    
    console.log('🔐 Authentication service initialized');
    console.log(`👤 User 1 password: ${this.user1Password}`);
    console.log(`👤 User 2 password: ${this.user2Password}`);
  }

  validatePassword(password: string): AuthResult {
    if (password === this.user1Password) {
      return {
        success: true,
        userIdentity: 'User1',
        message: 'User 1 authenticated successfully'
      };
    }
    
    if (password === this.user2Password) {
      return {
        success: true,
        userIdentity: 'User2',
        message: 'User 2 authenticated successfully'
      };
    }
    
    return {
      success: false,
      message: 'Invalid password'
    };
  }

  getUserIdentity(password: string): 'User1' | 'User2' | null {
    if (password === this.user1Password) return 'User1';
    if (password === this.user2Password) return 'User2';
    return null;
  }
}