import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'camping-checks',
    loadChildren: () => import('pages_camping_camping-calculation').then((m) => m.CampingCalculationModule),
  },
  {
    path: 'travel-map',
    loadChildren: () => import('pages_travel-map_travel-map').then((m) => m.TravelMapModule),
  },
  {
    path: '',
    redirectTo: 'camping-checks',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
