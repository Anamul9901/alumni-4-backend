import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  reset_password_email: process.env.RESET_PASSWORD_EMAIL,
  reset_password_password: process.env.RESET_PASSWORD_PASSWORD,

  fb_app_id: process.env.FB_APP_ID,
  fb_app_secret: process.env.FB_APP_SECRET,
  redirect_url: process.env.REDIRECT_URI,
  verify_token: process.env.VERIFY_TOKEN,
  openai_api_key: process.env.OPENAI_API_KEY,

  z_ai_api_url: process.env.Z_AI_API_URL,
  z_ai_api_key: process.env.Z_AI_API_KEY,
  z_ai_cache_control: process.env.Z_AI_CACHE_CONTROL ? JSON.parse(process.env.Z_AI_CACHE_CONTROL) : null,


  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
};
