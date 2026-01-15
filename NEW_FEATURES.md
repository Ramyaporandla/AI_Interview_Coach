# New Features Documentation

## 🔐 Forgot Password Feature

### Overview
Users can now reset their passwords if they forget them. The system sends a secure password reset link via email.

### Backend Implementation

#### Database Schema
- Added `password_reset_tokens` table to store reset tokens
- Tokens expire after 1 hour
- Tokens are marked as used after successful password reset

#### API Endpoints

1. **POST `/api/auth/forgot-password`**
   - Request body: `{ "email": "user@example.com" }`
   - Sends password reset email if user exists
   - Returns success message (prevents email enumeration)

2. **POST `/api/auth/reset-password`**
   - Request body: `{ "token": "reset-token", "password": "new-password" }`
   - Validates token and resets password
   - Token must be valid and not expired

#### Email Service
- Uses `nodemailer` for sending emails
- Configured via environment variables:
  - `SMTP_HOST` - SMTP server host (default: smtp.gmail.com)
  - `SMTP_PORT` - SMTP port (default: 587)
  - `SMTP_SECURE` - Use SSL/TLS (default: false)
  - `SMTP_USER` or `EMAIL_USER` - Email username
  - `SMTP_PASS` or `EMAIL_PASSWORD` - Email password
  - `FRONTEND_URL` - Frontend URL for reset links (default: http://localhost:5173)

### Frontend Implementation

#### Components
- **ForgotPassword.jsx**: Form to request password reset
- **ResetPassword.jsx**: Form to reset password with token from email

#### Routes
- `/forgot-password` - Request password reset
- `/reset-password?token=...` - Reset password with token

#### Usage
1. User clicks "Forgot password?" link on login page
2. Enters email address
3. Receives email with reset link
4. Clicks link to open reset password page
5. Enters new password
6. Redirected to login page

### Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173

# For Gmail, you'll need to:
# 1. Enable 2-factor authentication
# 2. Generate an App Password (not your regular password)
# 3. Use the App Password in SMTP_PASS
```

### Database Migration

Run the migration to add the password reset tokens table:

```bash
cd backend
npm run migrate
```

## 🎤 Voice Interview Feature

### Overview
Users can now answer interview questions using voice input. The system uses the Web Speech API for real-time speech-to-text transcription.

### Frontend Implementation

#### Components
- **VoiceRecorder.jsx**: Voice recording component with real-time transcription
- Integrated into **InterviewSession.jsx** with toggle between text and voice modes

#### Features
- Real-time speech-to-text transcription
- Start/Pause/Stop recording controls
- Visual feedback during recording
- Editable transcribed text
- Browser compatibility check

#### Browser Support
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (limited support - may need fallback)

#### Usage
1. Start an interview session
2. For non-technical questions, toggle to "Voice" mode
3. Click "Start Recording"
4. Speak your answer
5. Transcription appears in real-time
6. Edit transcribed text if needed
7. Submit answer as usual

### Technical Details

#### Web Speech API
- Uses `SpeechRecognition` or `webkitSpeechRecognition`
- Continuous recognition mode for longer answers
- Interim results for real-time feedback
- Language: English (US)

#### Fallback
- If Speech Recognition API is not available, shows browser compatibility message
- Users can still use text input mode

### Limitations
- Voice mode is only available for non-technical questions (behavioral, system-design)
- Technical questions still use code editor
- Requires microphone permissions
- Requires modern browser with Speech Recognition API support

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (no new dependencies needed)
cd ../frontend
npm install
```

### 2. Configure Email Service

Add email configuration to `backend/.env`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Migration

```bash
cd backend
npm run migrate
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📝 Testing

### Forgot Password Flow
1. Go to login page
2. Click "Forgot password?"
3. Enter your email
4. Check email for reset link
5. Click link and reset password
6. Login with new password

### Voice Interview Flow
1. Login and start an interview
2. Select behavioral or system-design interview type
3. Toggle to "Voice" mode
4. Click "Start Recording"
5. Speak your answer
6. Review transcribed text
7. Submit answer

## 🔒 Security Considerations

### Password Reset
- Tokens expire after 1 hour
- Tokens are single-use
- Tokens are cryptographically secure (32 bytes random)
- Email enumeration prevention (always returns success)
- Password validation (minimum 8 characters)

### Voice Recording
- All processing happens client-side
- No audio is sent to server (only transcribed text)
- Microphone permissions required
- Browser handles all security

## 🐛 Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify email service is configured correctly
- Check server logs for errors
- For Gmail, ensure App Password is used (not regular password)

### Voice Not Working
- Check browser compatibility
- Ensure microphone permissions are granted
- Try refreshing the page
- Check browser console for errors
- Fallback to text mode if needed

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)


