# 🚀 Quick Deploy Buttons

Deploy your 2-user chat application to your preferred cloud platform with one click:

## Render.com (Recommended)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo)

## Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

---

## Environment Variables Required

For all platforms, you'll need to set these environment variables:

```env
# 2-User Authentication
USER1_PASSWORD=your_secure_user1_password
USER2_PASSWORD=your_secure_user2_password

# Google Cloud Translation
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}

# Optional
DEFAULT_SOURCE_LANGUAGE=auto
DEFAULT_TARGET_LANGUAGE=en
```

## Features
- ✅ **2 distinct users** with separate passwords
- ✅ **Multiple device support** per user  
- ✅ **Real-time messaging** with user identification
- ✅ **Automatic Chinese ↔ English translation**
- ✅ **Image sharing** with user identity
- ✅ **Visual distinction** between User1 (blue) and User2 (green)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)