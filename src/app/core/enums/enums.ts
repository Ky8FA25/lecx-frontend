export enum Role {
    Admin = 1,
    Student = 2,
    Instructor = 3
}

export enum CourseLevel {
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2
}

export enum PaymentStatus {
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3
}

export enum CourseStatus {
    Draft = 0,
    Published = 1,
    Archived = 2,
    Active = 3,
    Inactive = 4
}

export enum TestStatus {
    Active = 0,
    Inactive = 1,
    Completed = 2
}

export enum CertificateStatus {
    Pending = 0,
    Completed = 1
}

export enum FileType {
    Image = 0,
    Video = 1,
    Document = 2,
    Other = 3
}

export enum NotificationType {
    Info = 0,
    Warning = 1,
    Alert = 2
}

export enum ReportStatus {
    Pending = 0,
    Reviewed = 1,
    Resolved = 2
}

export enum RefundStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

export enum InstructorConfirmationStatus {
    Pending = 0,
    Confirmed = 1,
    Rejected = 2
}

export enum Gender {
    Male = 0,
    Female = 1,
    Other = 2
}