import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./features/auth/components/login/login";
import { Home } from './features/home/components/home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'LecX';
}
