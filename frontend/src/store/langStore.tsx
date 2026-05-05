import { createContext, useContext, useState } from "react";

type Lang = "en" | "ru";

const translations = {
    en: {
        projects: "Projects",
        notifications: "Notifications",
        welcome: "Welcome",
        logout: "Logout",
        login: "Login",
        register: "Register",
        email: "Email",
        password: "Password",
        firstName: "First Name",
        lastName: "Last Name",
        role: "Role",
        student: "Student",
        teacher: "Teacher",
        noAccount: "Don't have an account?",
        registerHere: "Register here",
        stages: "Stages",
        createStage: "Create Stage",
        newStage: "New Stage",
        title: "Title",
        description: "Description",
        order: "Order",
        cancel: "Cancel",
        create: "Create",
        createProject: "Create New Project",
        newProject: "New Project",
        save: "Save",
        submitResult: "Submit Result",
        submittedResults: "Submitted Results",
        grade: "Grade",
        submitGrade: "Submit Grade",
        text: "Text",
        attachments: "Attachments",
        score: "Score",
        feedback: "Feedback",
        noNotifications: "No notifications",
        markAsRead: "Mark as read",
        loading: "Loading...",
        failedRegister: "Failed to register",
        invalidCredentials: "Invalid email or password",
        inviteStudent: "Invite Student",
        searchByEmail: "Search by email",
        search: "Search",
        addToProject: "Add to project",
        userNotFound: "User not found",
        memberAdded: "Member added successfully",
        members: "Members",
        adminPanel: "Admin Panel",
        allUsers: "All Users",
        allProjects: "All Projects",
        deleteUser: "Delete User",
        deleteProject: "Delete Project",
        confirmDeleteUser: "Delete this user?",
        confirmDeleteProject: "Delete this project?",
        delete: "Delete",
        checkEmailTitle: "Check your email",
        checkEmailDesc: "We sent a confirmation link to your email. Please follow it to activate your account.",
        backToLogin: "Back to login",
        emailNotConfirmed: "Please confirm your email before logging in",
        verifyingEmail: "Verifying your email...",
        emailVerified: "Email confirmed! You can now log in.",
        verifyError: "Verification failed. The link may have expired.",
    },
    ru: {
        projects: "Проекты",
        notifications: "Уведомления",
        welcome: "Добро пожаловать",
        logout: "Выйти",
        login: "Войти",
        register: "Регистрация",
        email: "Email",
        password: "Пароль",
        firstName: "Имя",
        lastName: "Фамилия",
        role: "Роль",
        student: "Студент",
        teacher: "Преподаватель",
        noAccount: "Нет аккаунта?",
        registerHere: "Зарегистрироваться",
        stages: "Этапы",
        createStage: "Создать этап",
        newStage: "Новый этап",
        title: "Название",
        description: "Описание",
        order: "Порядок",
        cancel: "Отмена",
        create: "Создать",
        createProject: "Создать проект",
        newProject: "Новый проект",
        save: "Сохранить",
        submitResult: "Отправить работу",
        submittedResults: "Отправленные работы",
        grade: "Оценить",
        submitGrade: "Поставить оценку",
        text: "Текст",
        attachments: "Вложения",
        score: "Оценка",
        feedback: "Комментарий",
        noNotifications: "Нет уведомлений",
        markAsRead: "Отметить прочитанным",
        loading: "Загрузка...",
        failedRegister: "Ошибка регистрации",
        invalidCredentials: "Неверный email или пароль",
        inviteStudent: "Пригласить студента",
        searchByEmail: "Поиск по email",
        search: "Найти",
        addToProject: "Добавить в проект",
        userNotFound: "Пользователь не найден",
        memberAdded: "Участник добавлен",
        members: "Участники",
        adminPanel: "Панель администратора",
        allUsers: "Все пользователи",
        allProjects: "Все проекты",
        deleteUser: "Удалить пользователя",
        deleteProject: "Удалить проект",
        confirmDeleteUser: "Удалить этого пользователя?",
        confirmDeleteProject: "Удалить этот проект?",
        delete: "Удалить",
        checkEmailTitle: "Проверьте почту",
        checkEmailDesc: "Мы отправили ссылку для подтверждения на ваш email. Перейдите по ней, чтобы активировать аккаунт.",
        backToLogin: "Вернуться ко входу",
        emailNotConfirmed: "Подтвердите email перед входом",
        verifyingEmail: "Подтверждение email...",
        emailVerified: "Email подтверждён! Теперь вы можете войти.",
        verifyError: "Ошибка подтверждения. Ссылка могла устареть.",
    }
};

type Translations = typeof translations.en;

const LangContext = createContext<{
    lang: Lang;
    t: Translations;
    toggleLang: () => void;
}>({
    lang: "ru",
    t: translations.ru,
    toggleLang: () => {}
});

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Lang>("ru");
    const toggleLang = () => setLang(l => l === "en" ? "ru" : "en");
    return (
        <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    return useContext(LangContext);
}
