import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'camping-checks',
    loadChildren: () =>
      import('./camping-calculation/camping-calculation.module').then((m) => m.CampingCalculationModule),
  },
  {
    path: 'travel-map',
    loadChildren: () => import('./travel-map/travel-map.module').then((m) => m.TravelMapModule),
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
