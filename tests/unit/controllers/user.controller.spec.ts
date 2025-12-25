import { describe, it, expect, vi, beforeEach } from 'vitest';
import userController from '../../../src/controllers/user.controller';
import userService from '../../../src/services/user.service';

vi.mock('../../../src/services/user.service');

describe('User Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: {},
      params: {},
      userData: { id: 1 },
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  });

  describe('createUser', () => {
    it('should create a user and return success response', async () => {
      req.body = { username: 'test', email: 'test@example.com' };
      const mockUser = { id: 1, username: 'test' };
      vi.mocked(userService.createUser).mockResolvedValue(mockUser as any);

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith({
        username: 'test',
        displayName: undefined,
        email: 'test@example.com',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User created successfully!',
        data: mockUser,
      });
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }];
      vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers as any);

      await userController.getUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Users data retrieved successfully!',
        data: mockUsers,
      });
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      req.params.id = '1';
      const mockUser = { id: 1 };
      vi.mocked(userService.getUserById).mockResolvedValue(mockUser as any);

      await userController.getUser(req, res);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User data retrieved successfully!',
        data: mockUser,
      });
    });

    it('should return 400 if id is not a number', async () => {
      req.params.id = 'abc';
      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User id must be a number',
      }));
    });
  });

  describe('updateUser', () => {
    it('should update user and return success', async () => {
      req.params.id = '1';
      req.body = { displayName: 'Updated' };
      const mockUser = { id: 1, displayName: 'Updated' };
      vi.mocked(userService.updateUser).mockResolvedValue(mockUser as any);

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith(1, {
        username: undefined,
        displayName: 'Updated',
        email: undefined,
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User 1 updated successfully',
      }));
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return success', async () => {
      req.params.id = '1';
      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User successfully deleted',
      }));
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      req.userData = { id: 1 };
      req.body = { currentPassword: 'old', newPassword: 'new' };

      await userController.updatePassword(req, res);

      expect(userService.updatePassword).toHaveBeenCalledWith(1, 'old', 'new');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password updated successfully',
      });
    });

    it('should return 401 if user not authenticated', async () => {
      req.userData = undefined;
      await userController.updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not authenticated',
      }));
    });
  });
});
