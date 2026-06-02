export const USER_ROLE = {
    admin: "admin",
    project_manager: "project_manager",
    team_member: "team_member"
} as const

export type TUserRole = keyof typeof USER_ROLE;
