import { Component } from '@angular/core';
import { ScullyRoutesService } from '@scullyio/ng-lib';
import { map } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  links$ = this.scully.available$.pipe(
    map((routes) => routes.filter((route) => route.route.startsWith('/blog')))
  );

  constructor(private scully: ScullyRoutesService) {}
}
