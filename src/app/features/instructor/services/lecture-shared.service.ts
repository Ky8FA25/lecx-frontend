import { Injectable, signal, computed } from '@angular/core';
import { LectureDTO } from '../models/instructor.models';

/**
 * Service để share lectures data giữa InstructorLayout và các child components
 */
@Injectable({
  providedIn: 'root'
})
export class LectureSharedService {
  // Map courseId -> lectures array
  private lecturesMap = signal<Map<number, LectureDTO[]>>(new Map());

  /**
   * Set lectures cho một course
   */
  setLectures(courseId: number, lectures: LectureDTO[]): void {
    const currentMap = new Map(this.lecturesMap());
    currentMap.set(courseId, lectures);
    this.lecturesMap.set(currentMap);
    console.log(`📚 LectureSharedService: Set ${lectures.length} lectures for course ${courseId}`);
  }

  /**
   * Get lectures cho một course (reactive signal)
   */
  getLecturesSignal(courseId: number) {
    return computed(() => {
      const lectures = this.lecturesMap().get(courseId);
      return lectures || [];
    });
  }

  /**
   * Get lecture count cho một course (reactive signal)
   */
  getLectureCountSignal(courseId: number) {
    return computed(() => {
      const lectures = this.lecturesMap().get(courseId);
      return lectures ? lectures.length : 0;
    });
  }

  /**
   * Get lectures cho một course (synchronous, non-reactive)
   */
  getLectures(courseId: number): LectureDTO[] {
    const lectures = this.lecturesMap().get(courseId);
    return lectures || [];
  }

  /**
   * Get lecture count cho một course (synchronous, non-reactive)
   */
  getLectureCount(courseId: number): number {
    return this.getLectures(courseId).length;
  }

  /**
   * Clear lectures cho một course
   */
  clearLectures(courseId: number): void {
    const currentMap = new Map(this.lecturesMap());
    currentMap.delete(courseId);
    this.lecturesMap.set(currentMap);
  }

  /**
   * Clear all lectures
   */
  clearAll(): void {
    this.lecturesMap.set(new Map());
  }
}

