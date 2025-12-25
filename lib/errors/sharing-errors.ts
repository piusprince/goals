/**
 * Error codes for invite-related operations
 */
export enum InviteErrorCode {
  INVITE_NOT_FOUND = "INVITE_NOT_FOUND",
  INVITE_EXPIRED = "INVITE_EXPIRED",
  INVITE_REVOKED = "INVITE_REVOKED",
  ALREADY_MEMBER = "ALREADY_MEMBER",
  INVALID_TOKEN = "INVALID_TOKEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED",
  EMAIL_ALREADY_INVITED = "EMAIL_ALREADY_INVITED",
}

/**
 * Error codes for membership-related operations
 */
export enum MembershipErrorCode {
  NOT_A_MEMBER = "NOT_A_MEMBER",
  ALREADY_MEMBER = "ALREADY_MEMBER",
  OWNER_CANNOT_LEAVE = "OWNER_CANNOT_LEAVE",
  CANNOT_CHANGE_OWNER_ROLE = "CANNOT_CHANGE_OWNER_ROLE",
  CANNOT_REMOVE_OWNER = "CANNOT_REMOVE_OWNER",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_ROLE = "INVALID_ROLE",
  GOAL_NOT_SHARED = "GOAL_NOT_SHARED",
}

/**
 * Custom error class for invite-related errors
 */
export class InviteError extends Error {
  public readonly code: InviteErrorCode;
  public readonly statusCode: number;

  constructor(code: InviteErrorCode, message?: string) {
    const defaultMessage = InviteError.getDefaultMessage(code);
    super(message || defaultMessage);
    this.name = "InviteError";
    this.code = code;
    this.statusCode = InviteError.getStatusCode(code);
  }

  private static getDefaultMessage(code: InviteErrorCode): string {
    const messages: Record<InviteErrorCode, string> = {
      [InviteErrorCode.INVITE_NOT_FOUND]: "Invite not found",
      [InviteErrorCode.INVITE_EXPIRED]: "This invite has expired",
      [InviteErrorCode.INVITE_REVOKED]: "This invite has been revoked",
      [InviteErrorCode.ALREADY_MEMBER]: "You are already a member of this goal",
      [InviteErrorCode.INVALID_TOKEN]: "Invalid invite token",
      [InviteErrorCode.UNAUTHORIZED]:
        "You are not authorized to perform this action",
      [InviteErrorCode.RATE_LIMITED]:
        "Too many invites sent. Please try again later",
      [InviteErrorCode.EMAIL_ALREADY_INVITED]:
        "This email has already been invited",
    };
    return messages[code];
  }

  private static getStatusCode(code: InviteErrorCode): number {
    const statusCodes: Record<InviteErrorCode, number> = {
      [InviteErrorCode.INVITE_NOT_FOUND]: 404,
      [InviteErrorCode.INVITE_EXPIRED]: 410,
      [InviteErrorCode.INVITE_REVOKED]: 410,
      [InviteErrorCode.ALREADY_MEMBER]: 409,
      [InviteErrorCode.INVALID_TOKEN]: 400,
      [InviteErrorCode.UNAUTHORIZED]: 403,
      [InviteErrorCode.RATE_LIMITED]: 429,
      [InviteErrorCode.EMAIL_ALREADY_INVITED]: 409,
    };
    return statusCodes[code];
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Custom error class for membership-related errors
 */
export class MembershipError extends Error {
  public readonly code: MembershipErrorCode;
  public readonly statusCode: number;

  constructor(code: MembershipErrorCode, message?: string) {
    const defaultMessage = MembershipError.getDefaultMessage(code);
    super(message || defaultMessage);
    this.name = "MembershipError";
    this.code = code;
    this.statusCode = MembershipError.getStatusCode(code);
  }

  private static getDefaultMessage(code: MembershipErrorCode): string {
    const messages: Record<MembershipErrorCode, string> = {
      [MembershipErrorCode.NOT_A_MEMBER]: "You are not a member of this goal",
      [MembershipErrorCode.ALREADY_MEMBER]: "Already a member of this goal",
      [MembershipErrorCode.OWNER_CANNOT_LEAVE]:
        "Goal owners cannot leave their own goals",
      [MembershipErrorCode.CANNOT_CHANGE_OWNER_ROLE]:
        "Cannot change the owner's role",
      [MembershipErrorCode.CANNOT_REMOVE_OWNER]: "Cannot remove the goal owner",
      [MembershipErrorCode.UNAUTHORIZED]:
        "You are not authorized to perform this action",
      [MembershipErrorCode.INVALID_ROLE]: "Invalid role specified",
      [MembershipErrorCode.GOAL_NOT_SHARED]: "This goal is not a shared goal",
    };
    return messages[code];
  }

  private static getStatusCode(code: MembershipErrorCode): number {
    const statusCodes: Record<MembershipErrorCode, number> = {
      [MembershipErrorCode.NOT_A_MEMBER]: 403,
      [MembershipErrorCode.ALREADY_MEMBER]: 409,
      [MembershipErrorCode.OWNER_CANNOT_LEAVE]: 400,
      [MembershipErrorCode.CANNOT_CHANGE_OWNER_ROLE]: 400,
      [MembershipErrorCode.CANNOT_REMOVE_OWNER]: 400,
      [MembershipErrorCode.UNAUTHORIZED]: 403,
      [MembershipErrorCode.INVALID_ROLE]: 400,
      [MembershipErrorCode.GOAL_NOT_SHARED]: 400,
    };
    return statusCodes[code];
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Type guard to check if an error is an InviteError
 */
export function isInviteError(error: unknown): error is InviteError {
  return error instanceof InviteError;
}

/**
 * Type guard to check if an error is a MembershipError
 */
export function isMembershipError(error: unknown): error is MembershipError {
  return error instanceof MembershipError;
}

/**
 * Get user-friendly error message for sharing errors
 */
export function getSharingErrorMessage(error: unknown): string {
  if (isInviteError(error) || isMembershipError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
