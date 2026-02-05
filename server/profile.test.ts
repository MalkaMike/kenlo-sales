import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Profile Management", () => {
  // Mock context with authenticated user
  const mockContext: Context = {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@kenlo.com.br",
      avatarUrl: null,
      phone: null,
      bio: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      headers: {},
      cookies: {},
    } as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  describe("profile.me", () => {
    it("should return current user profile", async () => {
      const profile = await caller.profile.me();
      
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.name).toBeDefined();
    });

    it("should throw error when user is not authenticated", async () => {
      const unauthenticatedCaller = appRouter.createCaller({
        ...mockContext,
        user: null,
      });

      await expect(unauthenticatedCaller.profile.me()).rejects.toThrow(
        "Please login (10001)"
      );
    });
  });

  describe("profile.update", () => {
    it("should update user profile fields", async () => {
      const updatedProfile = await caller.profile.update({
        name: "Updated Name Test",
        phone: "+55 11 99999-9999",
        bio: "This is my bio test",
      });

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.name).toBe("Updated Name Test");
      expect(updatedProfile.phone).toBe("+55 11 99999-9999");
      expect(updatedProfile.bio).toBe("This is my bio test");
    });

    it("should update only provided fields", async () => {
      const updatedProfile = await caller.profile.update({
        phone: "+55 11 88888-8888",
      });

      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.phone).toBe("+55 11 88888-8888");
      // Name should remain unchanged
      expect(updatedProfile.name).toBeDefined();
    });

    it("should throw error when user is not authenticated", async () => {
      const unauthenticatedCaller = appRouter.createCaller({
        ...mockContext,
        user: null,
      });

      await expect(
        unauthenticatedCaller.profile.update({ name: "Test" })
      ).rejects.toThrow("Please login (10001)");
    });
  });

  describe("profile.uploadAvatar", () => {
    it("should validate input parameters", async () => {
      // Test that the procedure expects correct input shape
      await expect(
        caller.profile.uploadAvatar({
          fileData: "base64encodedstring",
          fileName: "avatar.jpg",
          mimeType: "image/jpeg",
        })
      ).resolves.toBeDefined();
    });

    it("should throw error when user is not authenticated", async () => {
      const unauthenticatedCaller = appRouter.createCaller({
        ...mockContext,
        user: null,
      });

      await expect(
        unauthenticatedCaller.profile.uploadAvatar({
          fileData: "base64encodedstring",
          fileName: "avatar.jpg",
          mimeType: "image/jpeg",
        })
      ).rejects.toThrow("Please login (10001)");
    });
  });

  describe("profile.getProposalHistory", () => {
    it("should return proposal history for authenticated user", async () => {
      const history = await caller.profile.getProposalHistory({
        limit: 10,
      });

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const history = await caller.profile.getProposalHistory({
        limit: 5,
      });

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(5);
    });

    it("should use default limit when not provided", async () => {
      const history = await caller.profile.getProposalHistory({});

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
