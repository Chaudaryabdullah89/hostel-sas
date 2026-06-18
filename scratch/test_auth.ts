import AuthService from '../lib/services/AuthServices/authservices';

async function main() {
  const auth = new AuthService();
  const res = await auth.login({
    email: '1@gmail.com',
    password: 'password123'
  });
  console.log('Login Result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
