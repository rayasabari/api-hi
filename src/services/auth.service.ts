import { handleDuplicateEntryError } from '../errors/error-utils.ts';
import env from '../config/env.ts';
import { AppError } from '../errors/app-error.ts';
import userRepository from '../repositories/user.repository.ts';
import type { PublicUser } from '../types/user.ts';
import { toPublicUser } from './user.mapper.ts';
import { hashPassword, comparePassword } from '../utils/password-utils.ts';
import emailService from './email.service.ts';
import { generateResetToken, generateVerificationToken, hashToken, generateJwtToken } from '../utils/token-utils.ts';
import logger from '../config/logger.ts';

type RegisterInput = {
  username: string;
  displayName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const register = async (payload: RegisterInput): Promise<PublicUser> => {
  try {
    const hashedPassword = await hashPassword(payload.password);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + env.emailVerificationTokenExpiry);

    const user = await userRepository.create({
      username: payload.username,
      displayName: payload.displayName,
      email: payload.email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Log successful registration (audit trail)
    logger.info({
      action: 'user_registered',
      userId: user.id,
      email: user.email,
      username: user.username,
      verificationEmailSent: true,
      tokenExpiresAt: verificationExpires.toISOString(),
    }, 'User registered successfully and verification email sent');

    return toPublicUser(user);
  } catch (error) {
    // Log registration failure (audit trail)
    logger.error({
      action: 'user_registration_failed',
      email: payload.email,
      username: payload.username,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'User registration failed');

    return handleDuplicateEntryError(error);
  }
};

const login = async (
  payload: LoginInput,
): Promise<{ user: PublicUser; token: string }> => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) {
    // Log failed login - user not found (audit trail)
    logger.warn({
      action: 'login_failed',
      email: payload.email,
      reason: 'user_not_found',
    }, 'Login failed - user not found');

    throw new AppError('User not found!', 401);
  }

  if (!user.password) {
    // Log failed login - password not set (audit trail)
    logger.warn({
      action: 'login_failed',
      email: payload.email,
      userId: user.id,
      reason: 'password_not_set',
    }, 'Login failed - password not set');

    throw new AppError('Password not set!', 401);
  }

  const passwordValid = await comparePassword(payload.password, user.password);

  if (!passwordValid) {
    // Log failed login - invalid password (audit trail)
    logger.warn({
      action: 'login_failed',
      email: payload.email,
      userId: user.id,
      reason: 'invalid_password',
    }, 'Login failed - invalid password');

    throw new AppError('Invalid credentials!', 401);
  }

  const publicUser = toPublicUser(user);
  const token = generateJwtToken(publicUser, env.jwtSecret, env.jwtExpiration);

  // Log successful login (audit trail)
  logger.info({
    action: 'user_login',
    userId: user.id,
    email: user.email,
  }, 'User logged in successfully');

  return {
    user: publicUser,
    token,
  };
};

const forgotPassword = async (email: string) => {
  const user = await userRepository.findByEmail(email);

  // Log forgot password request (audit trail)
  logger.info({
    action: 'forgot_password_requested',
    email: email,
    userExists: !!user,
  }, 'Forgot password requested');

  if (!user) {
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const hashedToken = hashToken(resetToken);

  // Set expiry time
  const expiresAt = new Date(Date.now() + env.resetPasswordTokenExpiry);

  // Save reset token to database
  await userRepository.saveResetToken(user.email, hashedToken, expiresAt);

  // Log token generation (audit trail)
  logger.info({
    action: 'reset_token_generated',
    userId: user.id,
    email: user.email,
    expiresAt: expiresAt.toISOString(),
  }, 'Reset token generated and email sent');

  // Send reset password email with unhashed token
  await emailService.sendResetPasswordEmail(user.email, resetToken);

  return { message: 'If email exists, reset link has been sent' };
};

const resetPassword = async (token: string, newPassword: string) => {
  // Hash token received to match with database
  const hashedToken = hashToken(token);

  // Find user with valid and not expired reset token
  const user = await userRepository.findByResetToken(hashedToken);

  if (!user) {
    // Log failed reset attempt (audit trail)
    logger.warn({
      action: 'password_reset_failed',
      reason: 'invalid_or_expired_token',
      tokenPrefix: token.substring(0, 10) + '...',
    }, 'Password reset failed - invalid or expired token');

    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await userRepository.updatePassword(user.id, hashedPassword);

  // Clear reset token
  await userRepository.clearResetToken(user.id);

  // Log successful password reset (audit trail)
  logger.info({
    action: 'password_reset_successful',
    userId: user.id,
    email: user.email,
  }, 'Password reset successful');

  return { message: 'Password has been reset successfully' };
};

const verifyEmail = async (token: string) => {
  const user = await userRepository.findByVerificationToken(token);

  if (!user) {
    // Log failed verification attempt (audit trail)
    logger.warn({
      action: 'email_verification_failed',
      reason: 'invalid_or_expired_token',
      tokenPrefix: token.substring(0, 10) + '...',
    }, 'Email verification failed - invalid or expired token');

    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user - set verified and clear token
  await userRepository.clearVerificationToken(user.id);

  // Log successful verification (audit trail)
  logger.info({
    action: 'email_verified',
    userId: user.id,
    email: user.email,
  }, 'Email verified successfully');

  return { message: 'Email verified successfully!' };
};

const resendVerification = async (email: string) => {
  const user = await userRepository.findByEmail(email);

  // Log resend request (audit trail)
  logger.info({
    action: 'resend_verification_requested',
    email: email,
    userExists: !!user,
  }, 'Resend verification requested');

  if (!user) {
    // Don't reveal if email exists (security)
    return { message: 'If the email exists, a verification link has been sent.' };
  }

  if (user.emailVerified) {
    // Log attempt to resend for already verified email (audit trail)
    logger.warn({
      action: 'resend_verification_failed',
      userId: user.id,
      email: user.email,
      reason: 'already_verified',
    }, 'Resend verification failed - email already verified');

    throw new AppError('Email is already verified', 400);
  }

  // Generate new token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + env.emailVerificationTokenExpiry);

  await userRepository.saveVerificationToken(user.id, verificationToken, verificationExpires);

  // Send verification email
  await emailService.sendVerificationEmail(user.email, verificationToken);

  // Log successful resend (audit trail)
  logger.info({
    action: 'verification_email_resent',
    userId: user.id,
    email: user.email,
    tokenExpiresAt: verificationExpires.toISOString(),
  }, 'Verification email resent successfully');

  return { message: 'Verification email sent!' };
};

const authService = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};

export default authService;
