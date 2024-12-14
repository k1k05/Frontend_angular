import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-center">
        <button class="btn btn-primary m-3 p-3 w-50" (click)="openCategoryModal()">Dodaj Nową Kategorię</button>
        <button class="btn btn-primary m-3 p-3 w-50" (click)="openCategoriesModal()">Pokaż Listę Kategorii</button>
      </div>

      <div class="modal-backdrop  show" *ngIf="isCategoriesModalOpen || isCategoryModalOpen"></div>

      <!-- Modal dodawania -->
      <div class="modal " tabindex="-1" [class.show]="isCategoryModalOpen" style="display: block;" *ngIf="isCategoryModalOpen">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Edytuj Kategorię' : 'Dodaj Kategorię' }}</h5>
              <button type="button" class="btn-close" (click)="closeCategoryModal()"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Nazwa Kategorii</label>
                  <input type="text" class="form-control" id="name" [(ngModel)]="category.name" name="name" required>
                  <div *ngIf="errorMessages.name" class="text-danger">{{ errorMessages.name }}</div>
                </div>
                <button type="submit" class="btn btn-primary w-100">{{ isEditing ? 'Edytuj' : 'Dodaj' }}</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista kategorii -->
      <div class="modal " tabindex="-1" [class.show]="isCategoriesModalOpen" style="display: block;" *ngIf="isCategoriesModalOpen">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Lista Kategorii</h5>
              <button type="button" class="btn-close" (click)="closeCategoriesModal()"></button>
            </div>
            <div class="modal-body overflow-auto" style="max-height: 500px;">
              <div class="table-responsive">
                <table class="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th class="text-center">Nazwa</th>
                      <th class="text-center">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let category of categories">
                      <td>{{ category.name }}</td>
                      <td class="d-flex justify-content-end">
                        <button class="btn btn-warning btn-sm me-2" (click)="editCategory(category)">Edytuj</button>
                        <button class="btn btn-danger btn-sm" (click)="deleteCategory(category.id)">Usuń</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  `,
  styleUrls: ['../../styles.scss']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  category: any = { name: '' };
  isEditing: boolean = false;
  isCategoryModalOpen: boolean = false;
  isCategoriesModalOpen: boolean = false;
  errorMessages: any = [];

  @Output() categoriesChanged = new EventEmitter<void>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  openCategoryModal(): void {
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
    this.resetForm();
    this.categoriesChanged.emit();
  }

  openCategoriesModal(): void {
    this.isCategoriesModalOpen = true;
  }

  closeCategoriesModal(): void {
    this.isCategoriesModalOpen = false;
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.updateCategory();
    } else {
      this.addCategory();
    }
  }

  addCategory(): void {
    this.categoryService.addCategory(this.category).subscribe({
      next: () => {
        this.loadCategories();
        this.closeCategoryModal();
      },
      error: (err) => {
        this.handleApiErrors(err.error); 
      },
    });
  }

  updateCategory(): void {
    this.categoryService.updateCategory(this.category.id, this.category).subscribe({
      next: () => {
        this.loadCategories();
        this.closeCategoryModal();
      },
      error: (err) => {
        this.handleApiErrors(err.error); 
      },
    });
  }

  editCategory(category: any): void {
    this.category = { ...category };
    this.isEditing = true;
    this.openCategoryModal();
    this.closeCategoriesModal(); 
  }

  deleteCategory(id: number): void {
    const confirmDelete = window.confirm('Czy na pewno chcesz usunąć tę kategorię?');
    if (confirmDelete) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
  

  resetForm(): void {
    this.category = { name: '' };
    this.isEditing = false;
    this.errorMessages = {};
  }

  handleApiErrors(errors: any): void {
    this.errorMessages = errors; 
  }
}
