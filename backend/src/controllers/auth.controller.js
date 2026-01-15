import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/connection.js';
import { validationResult } from 'express-validator';
import { emailService } from '../services/email.service.js';

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, name, created_at`,
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generate email verification OTP
    const verificationOtp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing verification tokens for this user
    await db.query(
      'UPDATE email_verification_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [user.id]
    );

    // Store OTP
    await db.query(
      `INSERT INTO email_verification_tokens (user_id, otp_code, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, verificationOtp, otpExpiresAt]
    );

    // Send verification email
    try {
      await emailService.sendEmailVerificationOtp(user.email, verificationOtp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      verificationRequired: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const result = await db.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Invalidate any existing tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [user.id]
    );

    // Store reset token
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, resetToken, expiresAt]
    );

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find valid reset token
    const tokenResult = await db.query(
      `SELECT prt.*, u.id as user_id, u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        message: 'The password reset link is invalid or has expired. Please request a new one.',
      });
    }

    const resetToken = tokenResult.rows[0];
    const userId = resetToken.user_id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
      [resetToken.id]
    );

    res.json({
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with OTP
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const tokenResult = await db.query(
      `SELECT evt.*, u.id as user_id
       FROM email_verification_tokens evt
       JOIN users u ON evt.user_id = u.id
       WHERE u.email = $1 AND evt.otp_code = $2
         AND evt.used = FALSE AND evt.expires_at > NOW()`,
      [email, otp]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid or expired OTP',
        message: 'The verification code is invalid or has expired. Please request a new one.',
      });
    }

    const token = tokenResult.rows[0];

    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1',
      [token.user_id]
    );

    await db.query(
      'UPDATE email_verification_tokens SET used = TRUE WHERE id = $1',
      [token.id]
    );

    res.json({
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

