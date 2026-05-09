import { sendDeadlineEmail, sendVerificationEmail, sendStageSubmittedEmail, sendGradeReceivedEmail, sendProjectInvitationEmail } from "../src/services/email.service.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "email-id" }));

vi.mock("resend", () => ({
    Resend: vi.fn().mockImplementation(function () {
        return { emails: { send: mockSend } };
    })
}));

beforeEach(() => { vi.clearAllMocks(); });

describe("sendDeadlineEmail", () => {
    it("should send soft deadline email to student", async () => {
        await sendDeadlineEmail("student@test.ru", "Ivan", "Stage 1", "Project A", "soft", false);
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Мягкий дедлайн");
        expect(call.html).toContain("жёсткого дедлайна");
    });

    it("should send hard deadline email to student", async () => {
        await sendDeadlineEmail("student@test.ru", "Ivan", "Stage 1", "Project A", "hard", false);
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Жёсткий дедлайн");
        expect(call.html).toContain("просроченная");
    });

    it("should send teacher notification email", async () => {
        await sendDeadlineEmail("teacher@test.ru", "Anna", "Stage 1", "Project A", "soft", true);
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.html).toContain("преподаватель");
    });
});

describe("sendVerificationEmail", () => {
    it("should send verification email with link", async () => {
        process.env.FRONTEND_URL = "http://localhost:5173";
        await sendVerificationEmail("user@test.ru", "Ivan", "token123");
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Подтвердите");
        expect(call.html).toContain("token123");
    });
});

describe("sendStageSubmittedEmail", () => {
    it("should send stage submitted email to teacher", async () => {
        await sendStageSubmittedEmail("teacher@test.ru", "Anna", "Ivan Ivanov", "Stage 1", "Project A");
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Stage 1");
        expect(call.html).toContain("Ivan Ivanov");
        expect(call.html).toContain("Project A");
    });
});

describe("sendGradeReceivedEmail", () => {
    it("should send accepted grade email to student", async () => {
        await sendGradeReceivedEmail("student@test.ru", "Ivan", "Stage 1", true, "Хорошая работа");
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Stage 1");
        expect(call.html).toContain("Принято");
        expect(call.html).toContain("Хорошая работа");
    });

    it("should send rejected grade email to student", async () => {
        await sendGradeReceivedEmail("student@test.ru", "Ivan", "Stage 1", false);
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.html).toContain("Не принято");
    });
});

describe("sendProjectInvitationEmail", () => {
    it("should send project invitation email", async () => {
        process.env.FRONTEND_URL = "http://localhost:5173";
        await sendProjectInvitationEmail("student@test.ru", "Ivan", "Anna Teacher", "Project A");
        expect(mockSend).toHaveBeenCalledOnce();
        const call = mockSend.mock.calls[0][0];
        expect(call.subject).toContain("Project A");
        expect(call.html).toContain("Anna Teacher");
        expect(call.html).toContain("Ivan");
    });
});
