export enum UserRoles {
  ADMIN = "admin",
  STUDENT = "student",
  FACULTY = "faculty",
  HOD = "hod",
  DEAN = "dean",
  PRINCIPAL = "principal",
}

export enum TimeUnit {
  MINUTES = "minutes",
  SECONDS = "seconds",
  MINUTE = "minute",
  SECOND = "second",
  HOUR = "hour",
  HOURS = "hours",
  DAY = "day",
  DAYS = "days",
  MONTH = "month",
  MONTHS = "months",
  YEAR = "year",
  YEARS = "years",
}

export const UserCreationMessage = {
  STUDENT:
    "User created successfully. Please check given email for login instruction.",
  GENERAL:
    "User created successfully. Please check email for further instructions.",
};
