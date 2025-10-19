import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink, RouterOutlet } from "@angular/router";

export const SharedModule = [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    CommonModule,
    RouterOutlet
]