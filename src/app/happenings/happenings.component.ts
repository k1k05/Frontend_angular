import { Component, OnInit } from '@angular/core';
import { HappeningService } from '../services/happening.service';
import { CategoryService } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-happenings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex">
        <button class="btn btn-primary m-3 w-100 p-3" (click)="openHappeningModal()">Dodaj Nowe Wydarzenie</button>
      </div>


      <div class="modal-backdrop  show" *ngIf="isEventModalOpen || isHappeningModalOpen"></div>
      
      <div class="border rounded p-3">
        <div *ngFor="let week of calendarWeeks" class="row g-1">
          <div 
            *ngFor="let day of week" 
            class="col text-center p-2 border"
            [ngClass]="{'hapening': day.events.length > 0}" 
            (click)="onDayClick(day)">
            <div class="fw-bold">{{ day.date?.getDate() || '' }}</div>
            <div class="mt-2">
              <div *ngFor="let event of day.events" class="badge bg-info text-wrap d-inline-block w-100" (click)="openEventModal(event, $event)">
                <span>{{ event.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Modal wydarzenia -->
      <div class="modal " tabindex="-1" [class.show]="isEventModalOpen" style="display: block;" *ngIf="isEventModalOpen">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ selectedEvent?.name }}</h5>
              <button type="button" class="btn-close" (click)="closeEventModal()"></button>
            </div>
            <div class="modal-body">
              <p><strong>Początek:</strong> {{ formatTime(selectedEvent.startingTime) }}</p>
              <p><strong>Koniec:</strong> {{ formatTime(selectedEvent.endingTime) }}</p>
              <p><strong>Kategoria:</strong> {{ selectedEvent?.category.name }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-warning" (click)="editHappening(selectedEvent)">Edytuj</button>
              <button class="btn btn-danger" (click)="deleteHappening(selectedEvent.id)">Usuń</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal dodawania -->
      <div class="modal " tabindex="-1" [class.show]="isHappeningModalOpen" style="display: block;" *ngIf="isHappeningModalOpen">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditing ? 'Edytuj Wydarzenie' : 'Dodaj Wydarzenie' }}</h5>
              <button type="button" class="btn-close" (click)="closeHappeningModal()"></button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="name" class="form-label">Nazwa</label>
                  <input type="text" class="form-control" id="name" [(ngModel)]="happening.name" name="name" required>
                  <div *ngIf="errorMessages.name" class="text-danger">{{ errorMessages.name }}</div>
                </div>
                <div class="mb-3">
                  <label for="startingTime" class="form-label">Początek</label>
                  <input type="datetime-local" class="form-control" id="startingTime" [(ngModel)]="happening.startingTime" name="startingTime" required>
                  <div *ngIf="errorMessages.startingTime" class="text-danger">{{ errorMessages.startingTime }}</div>
                </div>
                <div class="mb-3">
                  <label for="endingTime" class="form-label">Koniec</label>
                  <input type="datetime-local" class="form-control" id="endingTime" [(ngModel)]="happening.endingTime" name="endingTime" required>
                  <div *ngIf="errorMessages.validTimes" class="text-danger">{{ errorMessages.validTimes }}</div>
                </div>
                <div class="mb-3">
                  <label for="category" class="form-label">Kategoria</label>
                  <select class="form-select" id="category" [(ngModel)]="happening.category.id" name="category" required>
                    <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary w-100">{{ isEditing ? 'Edytuj Wydarzenie' : 'Dodaj Wydarzenie' }}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
  </div>
  `,
  styleUrls: ['../../styles.scss']
})
export class HappeningsComponent implements OnInit {
  happenings: any[] = [];
  categories: any[] = [];
  happening: any = { name: '', startingTime: '', endingTime: '', category: { id: null } };
  isEditing: boolean = false;
  isHappeningModalOpen: boolean = false;
  selectedEvent: any = null;
  isEventModalOpen: boolean = false;
  errorMessages: any = {};
  calendarDays: Array<{ date: Date | null; events: any[] }> = [];
  calendarWeeks: Array<Array<{ date: Date | null; events: any[] }>> = [];

  constructor(
    private happeningService: HappeningService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadHappenings();
    this.generateCalendar();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadHappenings(): void {
    this.happeningService.getHappenings().subscribe(happenings => {
      this.happenings = happenings;
      this.generateCalendar();
    });
  }

  openHappeningModal(): void {
    this.isHappeningModalOpen = true;
    this.errorMessages = {};
  }

  closeHappeningModal(): void {
    this.isHappeningModalOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.updateHappening();
    } else {
      this.addHappening();
    }
  }

  addHappening(): void {
    this.happeningService.addHappening(this.happening).subscribe({
      next: () => {
        this.loadHappenings();
        this.closeHappeningModal();
      },
      error: (err) => {
        this.handleApiErrors(err.error); 
      },
    });
  }

  updateHappening(): void {
    delete this.happening.validTimes;
    this.happeningService.updateHappening(this.happening.id, this.happening).subscribe({
      next: () => {
        this.loadHappenings();
        this.closeHappeningModal();
      },
      error: (err) => {
        this.handleApiErrors(err.error); 
      },
    });
  }

  editHappening(happening: any): void {
    this.happening = { ...happening };
    this.isEditing = true;
    this.openHappeningModal();
  }

  deleteHappening(id: number): void {
    const confirmDelete = window.confirm('Czy na pewno chcesz usunąć to wydarzenie?');
    if (confirmDelete) {
      this.happeningService.deleteHappening(id).subscribe(() => {
        this.loadHappenings();
      });
    }
    this.closeEventModal();
  }

  resetForm(): void {
    this.happening = { name: '', startingTime: '', endingTime: '', category: { id: null } };
    this.isEditing = false;
    this.errorMessages = {};
  }

  handleApiErrors(errors: any): void {
    this.errorMessages = errors; 
  }

  generateCalendar(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
    this.calendarDays = [];
    

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const events = this.happenings.filter(happening =>
        this.isDateInRange(date, new Date(happening.startingTime), new Date(happening.endingTime))
      );
      this.calendarDays.push({ date, events });
    }
  
    while (this.calendarDays.length % 7 !== 0) {
      this.calendarDays.push({ date: null, events: [] });
    }
  
    this.splitIntoWeeks();
  }
  
  splitIntoWeeks(): void {
    const days = [...this.calendarDays];
    this.calendarWeeks = [];
    while (days.length) {
      this.calendarWeeks.push(days.splice(0, 7));
    }
  }
  
  isDateInRange(date: Date, start: Date, end: Date): boolean {
    const day = new Date(date);
    const startDay = new Date(start);
    const endDay = new Date(end);
  
    day.setHours(0, 0, 0, 0);
    startDay.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);
  
    return day >= startDay && day <= endDay;
  }
  
  

  onDayClick(day: any): void {
    if (day.events.length > 0) {
      this.openEventModal(day.events[0]); 
    }
  }

  openEventModal(event: any, eventClick?: MouseEvent): void {
    if (eventClick) {
      eventClick.stopPropagation(); 
    }
    this.selectedEvent = event;
    this.isEventModalOpen = true;
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
    this.selectedEvent = null;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
