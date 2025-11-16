export interface CommentUserDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImagePath?: string | null;
}

export interface CommentFileDto {
  filePath: string;
}

export interface CommentDto {
  commentId: number;
  lectureId: number;
  content: string;
  timestamp: string; // DateTime as string
  parentCmtId?: number | null;
  user: CommentUserDto;
  file?: CommentFileDto | null;
}

