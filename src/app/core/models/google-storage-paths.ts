export namespace GoogleStoragePaths {
  export const PublicRoot = 'public';
  export const PrivateRoot = 'private';
  export const SystemRoot = 'system';

  export namespace Public {
    export const AssignmentFiles = `${PublicRoot}/assignment-files`;
    export const AssignmentSubmissions = `${PublicRoot}/assignment-submissions`;
    export const CommentFiles = `${PublicRoot}/comment-files`;
    export const CourseCoverImages = `${PublicRoot}/course-cover-images`;
    export const CourseMaterials = `${PublicRoot}/course-materials`;
    export const LectureFiles = `${PublicRoot}/lecture-files`;
    export const LectureVideos = `${PublicRoot}/lecture-videos`;
    export const QuestionImages = `${PublicRoot}/question-images`;
    export const UserAvatars = `${PublicRoot}/user-avatars`;
    export const DefaultAvatars = `${PublicRoot}/user-avatars/default-avatar.png`;
  }

  export namespace Private {
    export const Certificates = `${PrivateRoot}/certificates`;
    export const InstructorCvs = `${PrivateRoot}/instructor-cvs`;
  }

  export namespace System {
    export const Root = SystemRoot;
  }

  export const Default = 'uploads';
}
