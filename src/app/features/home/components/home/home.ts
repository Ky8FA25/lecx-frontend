import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CategoryDto } from '../../models/categoryDto';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseDto } from '../../../courses/models/course-dto.model';


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy{
  private genericService = inject(GenericServices);

  category = signal<CategoryDto[] | null>(null);
  courses = signal<CourseDto[]>([]);
  activeCategoryId = signal<number | null>(null);
  loading = signal<boolean>(false);
  pageIndex : number = 1;
  pageSize : number = 6;


  ngOnInit(): void {
   const getallcategory =  this.genericService.get<CategoryDto[]>('api/categories/all').subscribe({
      next: (data : any) => {
        this.category.set(data.categories);
        console.log('✅ Categories loaded:', data);
        if (data.categories.length > 0) {
        const firstId = data.categories[0].categoryId;
        this.activeCategoryId.set(firstId);
        this.loadCourses(firstId);
      }
        
      },
      error: (err) => {
        console.error('❌ Failed to load categories:', err);
      }
    });
    this.genericService.AddSubscription(getallcategory);
  }
loadCourses(categoryId: number) {
    this.loading.set(true);
    const getAllCourseById = this.genericService.get(`api/courses/filter?categoryId=${categoryId}&pageIndex=${this.pageIndex}&pageSize=${this.pageSize}`).subscribe({
      next: (res: any) => {
        this.courses.set(res.data.items || []);
        this.activeCategoryId.set(categoryId);
        this.loading.set(false);
        console.log(this.courses());
        console.log(categoryId);
      },
      error: (err) => {
        console.error('❌ Load courses failed:', err);
        this.loading.set(false);
      }
    });

    this.genericService.AddSubscription(getAllCourseById);;
  }
  ngOnDestroy(): void {
    console.log('da huy')
    this.genericService.DeleteSubscription();
  }
}
