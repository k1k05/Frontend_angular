import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HappeningsComponent } from "./happenings/happenings.component";
import { CategoriesComponent } from "./categories/categories.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HappeningsComponent, CategoriesComponent],
  template: `
    <div>
      <h1 class="title text-center">Kalendarz</h1>
      <app-categories (categoriesChanged)="happeningsComponent.loadCategories()" />
      <app-happenings #happeningsComponent/>
    </div>
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
}
